import React, { useEffect, useRef, useState } from 'react'
import "./UserManagementComponent.css";
import UserSearchBarComponent from "../user-search-bar/UserSearchBarComponent"
import UserListItemComponent from '../user-list-item/UserListItemComponent';
import { FaUsersSlash } from "react-icons/fa";

const UserManagementComponent = ({ users, currentUser, onEdit, onDelete, onCreate }) => {

  const [filteredUsers, setFilteredUsers] = useState([]);
  const sortedUsersRef = useRef([]);

  useEffect(() => {
    const sorted = [...users].sort((a, b) => {

      if (a.id === currentUser.id) return -1;
      if (b.id === currentUser.id) return 1;

      if (a.role === "admin" && b.role !== "admin") return -1;
      if (a.role !== "admin" && b.role === "admin") return 1;

      return 0;
    });

    sortedUsersRef.current = sorted;
    setFilteredUsers(sorted);
  }, [users, currentUser]);


  const handleSearch = (term) => {
    if (term.trim() === "") {
      setFilteredUsers(sortedUsersRef.current);
    } else {
      const filtered = sortedUsersRef.current.filter((user) =>
        user.email.toLowerCase().includes(term.toLowerCase()) ||
        user.username.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  return (
    <div className="user-management-container">
      <UserSearchBarComponent onSearch={handleSearch} createButtonToggle={onCreate}/>

      {filteredUsers.length != 0 ? (<ul className="user-list">
        {filteredUsers.map((user) => (
          <UserListItemComponent
            key={user.id}
            user={user}
            isCurrentUser={user.id === currentUser?.id}
            onEdit={() => onEdit(user.id)}
            onDelete={() => onDelete(user)}
          />
        ))}
      </ul>) : (<div className='not-users-found'>
        <FaUsersSlash />
        <h4>No se encontraron usuarios</h4>
      </div>)}
    </div>
  );
}

export default UserManagementComponent