import './ConfirmationDialogComponent.css';
import ButtonComponent from '../button/ButtonComponent';

const ConfirmationDialogComponent = ({ message, onConfirm, onCancel }) => {

    return (
        <div className="confirmation-dialog-overlay">
            <div className="confirmation-dialog">
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
