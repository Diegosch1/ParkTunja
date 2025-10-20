import React, { useState } from 'react';
import "./UserSearchBarComponent.css";
import ButtonComponent from '../button/ButtonComponent';

const SearchBarComponent = ({ onSearch, createButtonToggle }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearch(value);
    };

    return (
        <div className="search-create-bar">
            <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="edit-input search-bar"
            />
            <ButtonComponent className='create-button' onClick={createButtonToggle} text="Crear" />
        </div>
    );
};

export default SearchBarComponent;