import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../axiosInstance';

const VerifyEmail = () => {
  const location = useLocation();
  const email = location.state?.email || ''; // Retrieve email from navigation state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Allow only numbers
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to the next input field if a number is entered
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleBackspace = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    try {
      const code = otp.join('');
      const response = await api.post('/auth/verify-email', { email, code });
      setMessage(response.data.message);
      navigate('/login');
    } catch (error) {
      console.error(error);
      setMessage('Invalid verification code');
    }
  };

  return (
    <div className="bg-zinc-950 h-screen flex justify-center items-center">
      <div className="flex flex-col justify-center items-center py-4 px-6 gap-4 border border-slate-500 rounded">
        <h1 className="text-2xl text-white font-bold">VERIFY EMAIL</h1>
        <p className="text-white text-sm text-center">Enter the 6-digit code sent to your email.</p>
        
        {/* OTP Input Fields */}
        <div className="flex gap-2">
          {otp.map((value, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              className="w-12 h-12 text-center text-lg font-bold text-white bg-zinc-900 border border-slate-500 rounded focus:border-white focus:outline-none"
              value={value}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleBackspace(index, e)}
              ref={(el) => (inputRefs.current[index] = el)}
            />
          ))}
        </div>

        <button
          className="bg-white w-full py-2 text-black rounded hover:scale-105 duration-300 hover:bg-slate-300"
          onClick={handleVerify}
        >
          VERIFY
        </button>

        {message && <p className="text-red-500 text-sm">{message}</p>}
        
        <p className="text-white text-sm">
          Didn't receive a code? <button className="hover:font-extrabold duration-200 text-slate-300">Resend</button>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
