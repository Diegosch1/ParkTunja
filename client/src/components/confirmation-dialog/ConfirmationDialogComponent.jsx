import './ConfirmationDialogComponent.css';
import ButtonComponent from '../button/ButtonComponent';

const ConfirmationDialogComponent = ({ isOpen = true, title, message, onConfirm, onCancel }) => {

    if (!isOpen) return null;

    return (
        <div className="confirmation-dialog-overlay">
            <div className="confirmation-dialog">
                {title && <h3 className="dialog-title">{title}</h3>}
                <p>{message}</p>
                <div className="dialog-buttons">
                    <ButtonComponent className='cancel-button' onClick={onCancel} text={`Cancelar`}/>
                    <ButtonComponent className='confirm-button' onClick={onConfirm} text={`Confirmar`}/>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialogComponent;
