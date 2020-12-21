// const login = async(email, password) => {
//     try{
//     const res = await axios({
//       method: 'POST',
//       url: 'http://127.0.0.1:3000/api/v1/users/login',
//       data: {
//         email,
//         password
//       }
//     });
//     if(res.data.status ==='success'){
//       alert('Logged in successFully')
//       window.setTimeout(()=>{
//         location.assign('/');
//       },1500);
//     }
//     }
//     catch(err){
//       alert(err.response.data.message);
//     }
// };

// document.querySelector('.form--login').addEventListener('submit',e=>{
//   e.preventDefault();
//   const email=  document.getElementById('email').value;
//   const password = document.getElementById('password').value;
//   login(email,password);
// });

/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout'
    });
    if ((res.data.status = 'success')) location.reload(true);
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};