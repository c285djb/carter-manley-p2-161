import React, { useState } from 'react';
import axios from 'axios';
//import { useHistory } from 'react-router-dom';

const Register = ({ authenticateUser }) => {
    let history = useHistory();
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        passwordConfirm: ''
    });
    //const [errorData, setErrorData] = useState({ errors: null});

    const {firstName, lastName, username, email, password, passwordConfirm} = userData;
   // const { errors } = errorData;

    const onChange = e => {
        const { username, value } = e.target;
        setUserData({
            ...userData,
            [username]: value
        }) 
    }


    const register = async () => {
        if(password !== passwordConfirm) {
            console.log('Passwords do not match');
        }
        else{
            const newUser = {
                firstName: firstName,
                lastName: lastName,
                username: username,
                email: email,
                password: password
            }

            try{
                const config = {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }

                const body = JSON.stringify(newUser);
                const res =  await axios.post('http://localhost:5000/api/users', body, config);
                console.log(res.data);
                // localStorage.setItem('token',res.data.token);
                // history.push('/');
            
            }catch (error){
                
                console.error(error.response.data);
                return;
                // localStorage.removeItem('token');

                // setErrorData({
                //     ...errors,
                //     errors: error.response.data.errors
                // })
            }

            // authenticateUser();
        }
    }

    return(
        <div>
            <h2>Register</h2>
            <div>
                <input
                type="text"
                placeholder="firstName"
                name="firstName"
                value={firstName}
                onChange={e =>onChange(e)} />
            </div>
            <div>
                <input
                type="text"
                placeholder="lastName"
                name="lastName"
                value={lastName}
                onChange={e =>onChange(e)} />
            </div>
            <div>
                <input
                type="text"
                placeholder="username"
                name="username"
                value={username}
                onChange={e =>onChange(e)} />
            </div>
            <div>
                <input
                type="text"
                placeholder="Email"
                name="email"
                value={email}
                onChange={e =>onChange(e)} />
            </div>
            <div>
                <input
                type="text"
                placeholder="Password"
                name="password"
                value={password}
                onChange={e =>onChange(e)} />
            </div>
            <div>
                <input
                type="text"
                placeholder="Confirm Password"
                name="passwordConfirm"
                value={passwordConfirm}
                onChange={e =>onChange(e)} />
            </div>
            <div>
                <button onClick={() => register()}>Register</button>
            </div>
            {/* <div>
                {errors && errors.map(error =>
                    <div key={error.msg}>{error.msg}</div>)}
            </div> */}
        </div>
    )
}

export default Register