import React, { useEffect, useRef, useState } from 'react'
import { CgMinimize } from 'react-icons/cg';
import { IoMdClose, IoMdExpand } from 'react-icons/io';
import "./UserAccessComponent.css";
import { useForm } from 'react-hook-form';
import ButtonComponent from '../button/ButtonComponent';
import PasswordInputComponent from '../password-input/PasswordInputComponent';

const UserAccessComponent = ({ onClose, userToEdit, onEdit, onCreate, currentUser }) => {

    const [expandComponent, setExpandComponent] = useState(false);
    const modalRef = useRef(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isValid },
    } = useForm({
        defaultValues: {
            username: '',
            email: '',
            role: '',
            password: '',
            confirmPassword: ''
        },
        mode: 'onChange'
    });

    const password = watch("password");

    useEffect(() => {
        if (userToEdit) {
            reset(userToEdit);
        }
    }, [userToEdit, reset]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
                setExpandComponent(false);
            }
        };

        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
                setExpandComponent(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscKey);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [onClose]);

    const onSubmit = (data) => {
        console.log(data);
        
        if (userToEdit == undefined) {
            const {confirmPassword, ...finalData} = data;
            onCreate(finalData);
        } else {
            onEdit(data);
        }
        onClose();
    };

    return (
        <div className="expanded-modal-backdrop">
            <div className={`expanded-modal ${expandComponent ? "full-screen" : ""} edit-modal ${!userToEdit ? "create-modal" : ""}`} ref={modalRef}>
                <div className="buttons">
                    {expandComponent ?
                        (<CgMinimize className='close-button expanded' onClick={() => setExpandComponent(false)} />)
                        : (<IoMdExpand className='close-button expanded' onClick={() => setExpandComponent(true)} />)}
                    <IoMdClose className='close-button expanded' onClick={() => { onClose(); setExpandComponent(false) }} />
                </div>
                <h2 className='title-edit'>
                    {userToEdit
                        ? `Editar usuario ${userToEdit.username}`
                        : `Crear usuario`}
                </h2>

                <form className="edit-user-form" onSubmit={handleSubmit(onSubmit)}>
                    <label>
                        {`Nombre de usuario`}
                        <input {...register("username", { required: true })} />
                        {errors.username && <span className="error">{`Este campo es obligatorio`}</span>}
                    </label>


                    <label>
                        {`Correo electrónico`}
                        <input type="email" {...register("email", { required: true })} />
                        {errors.email && <span className="error">{`Este campo es obligatorio`}</span>}
                    </label>

                    <PasswordInputComponent register={register} error={errors.password} isCreateUsed={userToEdit ? false : true} />

                    {!userToEdit && (
                        <label>
                            {`Confirmar contraseña`}
                            <input
                                type="password"
                                {...register("confirmPassword", {
                                    required: true,
                                    validate: value =>
                                        value === password || `Las contraseñas deben coincidir`
                                })}
                            />
                            {errors.confirmPassword && (
                                <span className="error">{errors.confirmPassword.message}</span>
                            )}
                        </label>
                    )}

                    {((currentUser?.id != userToEdit?.id) || !userToEdit) ? (<label>
                        {`Rol`}
                        <select {...register("role", { required: true })}>
                            <option value="admin">{`Administrador`}</option>
                            <option value="user">{`Controlador`}</option>
                        </select>
                        {errors.role && <span className="error">{`Este campo es obligatorio`}</span>}
                    </label>) : null}

                    <ButtonComponent text={userToEdit ? `Actualizar` : `Crear`} className='edit-user-button' htmlType='submit' disabled={!isValid}/>
                </form>
            </div>
        </div>
    )
}

export default UserAccessComponent