import React, { useEffect, useState } from 'react'
import ResponsiveNavComponent from '../../components/responsive-nav/ResponsiveNavComponent';
import SidebarComponent from '../../components/sidebar/SidebarComponent';
import './Adminpage.css';
import { useUsers } from "../../context/UsersContext";
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import UserManagementComponent from '../../components/user-managment/UserManagementComponent';
import ConfirmationDialogComponent from '../../components/confirmation-dialog/ConfirmationDialogComponent';
import UserAccessComponent from '../../components/edit-user/UserAccessComponent';

const AdminPage = () => {

  const { users, getUserInfo, getUsers, selectedUser, createUser, removeUser, updateUser } = useUsers();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [createUserModal, SetCreateUserModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState({ message: '', onConfirm: null });
 
  useEffect(() => {
    document.title = `ParkTunja - Admin Panel`;
  }, []);

  useEffect(() => {
    getUsers();
  }, []);

  const handleDeleteUser = (user) => {
    setConfirmData({
      message: `¿Estás seguro de que deseas eliminar a ${user.username}?`,
      onConfirm: async () => {
        try {
          await removeUser(user.id);
          setShowConfirm(false);
          await getUsers();
          toast.success(`Usuario ${user.username} eliminado`);
        } catch (error) {
          toast.error(`Error al eliminar usuario ${user.username}`);
        }
      },
    });
    setShowConfirm(true);
  };

  const handleEditUser = async (id) => {
    await getUserInfo(id);
    setIsEditing(true);
  }

  const updateUserSend = async (user) => {
    try {
      await updateUser(user);
      await getUsers();
      toast.success(`Usuario ${user.username} actualizado`);
    } catch (error) {
      toast.error(`Error al actualizar usuario ${user.username}`);
    }
  }

  const createUserSend = async (newUser) => {

    console.log(newUser);
    

    try {
      await createUser(newUser);
      setTimeout(async () => {
        await getUsers();
      }, 1000);
      toast.success(`Usuario ${newUser.username} creado`);
    } catch (error) {
      toast.error(`Error al crear usuario ${newUser.username}`);
    }
  }

  return (
    <>
      <div>
        <div className="main-container home">
          <ResponsiveNavComponent />
          <div className="main-content">
            <SidebarComponent />
            <div className="sidebar-spacer"></div>
            <UserManagementComponent users={users}
              onEdit={handleEditUser}
              onCreate={() => { SetCreateUserModal(true) }}
              onDelete={handleDeleteUser}
              currentUser={user} />
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmationDialogComponent
          message={confirmData.message}
          onConfirm={confirmData.onConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {isEditing && (
        <UserAccessComponent onClose={() => setIsEditing(false)} userToEdit={selectedUser} currentUser={user} onEdit={updateUserSend} />
      )}

      {createUserModal && (
        <UserAccessComponent onClose={() => SetCreateUserModal(false)} onCreate={createUserSend} />
      )}
    </>
  )
}

export default AdminPage