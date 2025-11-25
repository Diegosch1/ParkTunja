import React, { useEffect, useState } from 'react';
import './ReportsPage.css';
import ResponsiveNavComponent from '../../components/responsive-nav/ResponsiveNavComponent';
import SidebarComponent from '../../components/sidebar/SidebarComponent';
import InputComponent from '../../components/input/InputComponent';
import ButtonComponent from '../../components/button/ButtonComponent';
import { useParking } from '../../context/ParkingContext';
import { getReportRequest } from '../../api/reports';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReportsPage = () => {
    const { parkings, getAllParkings } = useParking();
    const [selectedParking, setSelectedParking] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [reportData, setReportData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        document.title = 'ParkTunja - Reportes';
        getAllParkings();
    }, []);


    // Función para formatear fecha legible
    const formatReadableDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleGenerateReport = async () => {
        if (!selectedParking) {
            toast.error('Selecciona un parqueadero');
            return;
        }
        if (!dateFrom || !dateTo) {
            toast.error('Selecciona el rango de fechas');
            return;
        }

        const from = new Date(dateFrom);
        const to = new Date(dateTo);

        if (from >= to) {
            toast.error('La fecha inicial debe ser menor a la fecha final');
            return;
        }

        setIsGenerating(true);
        try {
            const response = await getReportRequest(selectedParking, dateFrom, dateTo);
            setReportData(response.data);
            toast.success('Reporte generado exitosamente');
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Error al generar el reporte');
            setReportData(null);
        } finally {
            setIsGenerating(false);
        }
    };

    const generatePDF = () => {
        if (!reportData) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        let yPosition = 20;

        // Título
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('REPORTE DE PARQUEADERO', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;

        // Información del parqueadero
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Información del Parqueadero:', 14, yPosition);
        yPosition += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Nombre: ${reportData.parking.name}`, 14, yPosition);
        yPosition += 6;
        doc.text(`Ubicación: ${reportData.parking.location}`, 14, yPosition);
        yPosition += 10;

        // Período
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Período del Reporte:', 14, yPosition);
        yPosition += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Desde: ${formatReadableDate(reportData.period.fromLocal)}`, 14, yPosition);
        yPosition += 6;
        doc.text(`Hasta: ${formatReadableDate(reportData.period.toLocal)}`, 14, yPosition);
        yPosition += 10;

        // Estadísticas
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Estadísticas Generales:', 14, yPosition);
        yPosition += 7;

        const stats = [
            ['Métrica', 'Valor'],
            ['Total de Entradas', reportData.stats.totalEntries.toString()],
            ['Total de Salidas', reportData.stats.totalExits.toString()],
            ['Vehículos Actualmente Dentro', (reportData.stats.totalEntries - reportData.stats.totalExits).toString()],
            ['Ingresos Totales', `$${reportData.stats.totalRevenue.toLocaleString('es-CO')}`],
            ['Duración Promedio (horas)', reportData.stats.averageDurationHours.toFixed(2)],
        ];

        autoTable(doc, {
            startY: yPosition,
            head: [stats[0]],
            body: stats.slice(1),
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 10 },
            columnStyles: {
                0: { cellWidth: 80 },
                1: { cellWidth: 80, halign: 'right' }
            }
        });

        yPosition = doc.lastAutoTable.finalY + 10;

        // Eventos agrupados por día
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);

        if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
        }

        doc.text('Eventos por Día:', 14, yPosition);
        yPosition += 7;

        const groupedDays = Object.keys(reportData.groupedByDay);

        groupedDays.forEach((day, index) => {
            const events = reportData.groupedByDay[day];
            const entries = events.filter(e => e.type === 'entry').length;
            const exits = events.filter(e => e.type === 'exit').length;
            const revenue = events
                .filter(e => e.type === 'exit')
                .reduce((sum, e) => sum + (e.fee || 0), 0);

            if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text(`Día: ${new Date(day).toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}`, 14, yPosition);
            yPosition += 7;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(`Entradas: ${entries} | Salidas: ${exits} | Ingresos: $${revenue.toLocaleString('es-CO')}`, 14, yPosition);
            yPosition += 7;

            // Tabla de eventos del día
            const eventRows = events.map(event => [
                new Date(event.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
                event.type === 'entry' ? 'Entrada' : 'Salida',
                event.licensePlate,
                event.spotNumber.toString(),
                event.type === 'exit' ? `$${event.fee.toLocaleString('es-CO')}` : '-',
                event.type === 'exit' ? `${event.durationHours.toFixed(2)}h` : '-'
            ]);

            autoTable(doc, {
                startY: yPosition,
                head: [['Hora', 'Tipo', 'Placa', 'Espacio', 'Tarifa', 'Duración']],
                body: eventRows,
                theme: 'grid',
                headStyles: { fillColor: [52, 73, 94], textColor: 255, fontSize: 8 },
                styles: { fontSize: 8, cellPadding: 2 },
                columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 25 },
                    2: { cellWidth: 30 },
                    3: { cellWidth: 25 },
                    4: { cellWidth: 30, halign: 'right' },
                    5: { cellWidth: 25, halign: 'right' }
                }
            });

            yPosition = doc.lastAutoTable.finalY + 10;
        });

        // Footer en todas las páginas
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.text(
                `Página ${i} de ${totalPages} - Generado el ${new Date().toLocaleString('es-CO')}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
        }

        // Convertir PDF a blob y crear URL
        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);

        return doc;
    };

    const handleDownloadPDF = () => {
        const doc = generatePDF();
        const fileName = `Reporte_${reportData.parking.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        toast.success('PDF descargado exitosamente');
    };

    const handleViewPDF = () => {
        generatePDF();
        toast.info('PDF generado. Visualiza el reporte abajo.');
    };

    return (<>
        <ResponsiveNavComponent />
        <SidebarComponent />
        <div className="main-content">
            <div className="sidebar-spacer"></div>

            <div className="reports-container">
                <h1 className="reports-title">Generación de Reportes</h1>

                <div className="reports-form-card">
                    <h2 className="reports-section-title">Configuración del Reporte</h2>

                    <div className="reports-form-row">
                        <div className="reports-form-group">
                            <label className="reports-form-label">Parqueadero</label>
                            <select
                                className="reports-form-select"
                                value={selectedParking}
                                onChange={(e) => setSelectedParking(e.target.value)}
                            >
                                <option value="">Selecciona un parqueadero</option>
                                {parkings.map(parking => (
                                    <option key={parking.id} value={parking.id}>
                                        {parking.name} - {parking.location}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="reports-form-row">
                        <div className="reports-form-group">
                            <label className="reports-form-label">Fecha y Hora Desde</label>
                            <input
                                type="datetime-local"
                                className="reports-form-input"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>

                        <div className="reports-form-group">
                            <label className="reports-form-label">Fecha y Hora Hasta</label>
                            <input
                                type="datetime-local"
                                className="reports-form-input"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="reports-form-actions">
                        <ButtonComponent
                            text={isGenerating ? "Generando..." : "Generar Reporte"}
                            htmlType="button"
                            onClick={handleGenerateReport}
                            disabled={isGenerating}
                        />
                    </div>
                </div>

                {reportData && (
                    <>
                        <div className="reports-summary-card">
                            <h2 className="reports-section-title">Resumen del Reporte</h2>

                            <div className="reports-info">
                                <div className="reports-info-section">
                                    <h3 className="reports-info-title">Parqueadero</h3>
                                    <p className="reports-info-text">{reportData.parking.name}</p>
                                    <p className="reports-info-subtext">{reportData.parking.location}</p>
                                </div>

                                <div className="reports-info-section">
                                    <h3 className="reports-info-title">Período</h3>
                                    <p className="reports-info-text">
                                        {formatReadableDate(reportData.period.fromLocal)}
                                    </p>
                                    <p className="reports-info-subtext">
                                        hasta {formatReadableDate(reportData.period.toLocal)}
                                    </p>
                                </div>
                            </div>

                            <div className="reports-stats-grid">
                                <div className="reports-stat-card">

                                    <div className="reports-stat-content">
                                        <div className="reports-stat-value">{reportData.stats.totalEntries}</div>
                                        <div className="reports-stat-label">Entradas</div>
                                    </div>
                                </div>

                                <div className="reports-stat-card">
                                    <div className="reports-stat-content">
                                        <div className="reports-stat-value">{reportData.stats.totalExits}</div>
                                        <div className="reports-stat-label">Salidas</div>
                                    </div>
                                </div>

                                <div className="reports-stat-card">
                                    <div className="reports-stat-content">
                                        <div className="reports-stat-value">
                                            {reportData.stats.totalEntries - reportData.stats.totalExits}
                                        </div>
                                        <div className="reports-stat-label">Vehículos Dentro</div>
                                    </div>
                                </div>

                                <div className="reports-stat-card reports-stat-highlight">
                                    <div className="reports-stat-content">
                                        <div className="reports-stat-value">
                                            ${reportData.stats.totalRevenue.toLocaleString('es-CO')}
                                        </div>
                                        <div className="reports-stat-label">Ingresos Totales</div>
                                    </div>
                                </div>

                                <div className="reports-stat-card">
                                    <div className="reports-stat-content">
                                        <div className="reports-stat-value">
                                            {reportData.stats.averageDurationHours.toFixed(2)}h
                                        </div>
                                        <div className="reports-stat-label">Duración Promedio</div>
                                    </div>
                                </div>

                                <div className="reports-stat-card">
                                    <div className="reports-stat-content">
                                        <div className="reports-stat-value">
                                            {reportData.stats.totalExits > 0
                                                ? `$${(reportData.stats.totalRevenue / reportData.stats.totalExits).toFixed(0)}`
                                                : '$0'
                                            }
                                        </div>
                                        <div className="reports-stat-label">Tarifa Promedio</div>
                                    </div>
                                </div>
                            </div>

                            <div className="reports-pdf-actions">
                                <ButtonComponent
                                    text="Visualizar PDF"
                                    htmlType="button"
                                    onClick={handleViewPDF}
                                />
                                <ButtonComponent
                                    text="Descargar PDF"
                                    htmlType="button"
                                    onClick={handleDownloadPDF}
                                />
                            </div>
                        </div>

                        {pdfUrl && (
                            <div className="reports-pdf-viewer-card">
                                <h2 className="reports-section-title">Vista Previa del PDF</h2>
                                <iframe
                                    src={pdfUrl}
                                    className="reports-pdf-iframe"
                                    title="Vista previa del reporte"
                                />
                            </div>
                        )}

                        <div className="reports-events-table-card">
                            <h2 className="reports-section-title">Detalle de Eventos ({reportData.events.length})</h2>

                            <div className="reports-table-container">
                                <table className="reports-events-table">
                                    <thead>
                                        <tr>
                                            <th>Fecha y Hora</th>
                                            <th>Tipo</th>
                                            <th>Placa</th>
                                            <th>Espacio</th>
                                            <th>Tarifa</th>
                                            <th>Duración</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.events.map((event) => (
                                            <tr key={event._id} className={event.type === 'entry' ? 'reports-entry-row' : 'reports-exit-row'}>
                                                <td>{formatReadableDate(event.timestamp)}</td>
                                                <td>
                                                    <span className={`reports-event-badge reports-event-${event.type}`}>
                                                        {event.type === 'entry' ? 'Entrada' : 'Salida'}
                                                    </span>
                                                </td>
                                                <td className="reports-license-plate">{event.licensePlate}</td>
                                                <td className="reports-spot-number">#{event.spotNumber}</td>
                                                <td className="reports-fee">
                                                    {event.fee !== undefined ? `$${event.fee.toLocaleString('es-CO')}` : '-'}
                                                </td>
                                                <td className="reports-duration">
                                                    {event.durationHours !== undefined ? `${event.durationHours.toFixed(2)}h` : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    </>
    );
};

export default ReportsPage;
