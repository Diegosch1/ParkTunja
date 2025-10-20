import { FaCrown, FaUser } from 'react-icons/fa';
import ButtonComponent from '../button/ButtonComponent';
import './UserListItemComponent.css';

const UserListItemComponent = ({ user, isCurrentUser, onEdit, onDelete }) => {
    return (
        <li className={`user-list-item ${isCurrentUser ? 'highlighted' : ''}`}>
            <div className="user-info">
                <span className={`role-badge ${user.role}`}>{user.role === "admin" ? (<FaCrown className="user-icon" />) : (<FaUser className="user-icon" />)} {user.role}</span>
                <span>{user.username} - <span className='email-span'>({user.email})</span></span>
            </div>
            <div className="user-actions">
                <ButtonComponent className='edit-btn' onClick={onEdit} text="Editar" />
                {!isCurrentUser && (
                    <ButtonComponent className='delete-btn' onClick={onDelete} text="Eliminar" />
                )}
            </div>
        </li>
    );
};

export default UserListItemComponent;
