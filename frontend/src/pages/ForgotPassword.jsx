import React, { useState } from 'react';
import api from '../axiosInstance';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleSendCode = async () => {
    try {
      const response = await api.post('/auth/forgot-password-code', { email });
      console.log(response.data);
      setMessage(response.data.message);
      setStep(2);
    } catch (error) {
      console.error(error.message);
      setMessage('Error sending reset code');
    }
  };

  const handleVerifyCode = async () => {
    try {
      const verificationCode = code.join('');
      const response = await api.post('/auth/verify-password-code', { email, code: verificationCode });
      console.log(response.data);
      setMessage(response.data.message);
      setStep(3);
    } catch (error) {
      console.error(error.message);
      setMessage('Error verifying reset code');
    }
  };

  const handleChangePassword = async () => {
    try {
      const response = await api.post('/auth/update-password', { email, newPassword });
      console.log(response.data);
      setMessage(response.data.message);
      navigate('/login');
    } catch (error) {
      console.error(error.message);
      setMessage('Error changing password');
    }
  };

  const handleCodeChange = (index, value) => {
    if (isNaN(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`).focus();
    }
  };

  return (
    <div className="bg-zinc-950 flex items-center justify-center min-h-screen p-4">
      <div className="bg-zinc-950 border-[0.1px] p-8 rounded shadow-2xl w-full max-w-md">
        <h1 className="text-white text-center font-bold text-2xl mb-6">Reset Password</h1>
        {message && <p className="text-emerald-400 text-sm text-center mb-4">{message}</p>}

        {step === 1 && (
          <div className="mb-6">
            <div className="flex gap-2">
              <input 
                type="email" 
                className="w-full px-4 py-3 rounded border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white bg-zinc-950 text-white" 
                placeholder="Enter your email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button onClick={handleSendCode} className="bg-white hover:bg-zinc-200 transition-colors px-5 py-3 rounded font-medium text-zinc-900">Send</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mb-6">
            <label className="block text-zinc-400 text-sm mb-4">Enter Verification Code</label>
            <div className="flex justify-between gap-2">
              {code.map((digit, index) => (
                <input 
                  key={index} 
                  id={`code-${index}`}
                  type="text" 
                  maxLength="1" 
                  className="w-12 h-12 text-center text-xl bg-zinc-950 border border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-white text-white" 
                  value={digit} 
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                />
              ))}
            </div>
            <button onClick={handleVerifyCode} className="bg-white hover:bg-zinc-200 transition-colors text-zinc-900 font-medium py-3 px-4 rounded w-full mt-4">Verify Code</button>
            <p className="text-zinc-500 text-sm text-center mt-4">Didn't receive a code? <button onClick={handleSendCode} className="text-white hover:underline">Resend</button></p>
          </div>
        )}

        {step === 3 && (
          <div className="mb-6">
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white bg-zinc-950 text-white" 
              placeholder="Enter new password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button onClick={handleChangePassword} className="bg-white hover:bg-zinc-200 transition-colors text-zinc-900 font-medium py-3 px-4 rounded w-full mt-4">Change Password</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;