import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { LoginFormData } from '@/types';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/admin/dashboard';
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (error: any) {
      const message = error.response?.data?.message || '登入失敗，請檢查帳號密碼';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>登入 - ZeYang</title>
      </Helmet>
      
      <div className="min-h-screen flex">
        {/* Left side - Login form */}
        <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div>
              <Link to="/" className="text-3xl font-bold text-primary-600">
                澤暘建設
              </Link>
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                登入您的帳號
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                請輸入您的帳號密碼以存取管理後台
              </p>
            </div>

            <div className="mt-8">
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    帳號
                  </label>
                  <div className="mt-1">
                    <input
                      {...register('username', { required: '請輸入帳號' })}
                      type="text"
                      autoComplete="username"
                      className="input"
                      placeholder="請輸入帳號或 Email"
                    />
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    密碼
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('password', { required: '請輸入密碼' })}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className="input pr-10"
                      placeholder="請輸入密碼"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? '登入中...' : '登入'}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <p className="text-sm text-gray-600 text-center">
                  預設管理員帳號：admin / admin123456
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="hidden lg:block relative w-0 flex-1">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80"
            alt="Modern building"
          />
          <div className="absolute inset-0 bg-primary-900 bg-opacity-40" />
        </div>
      </div>
    </>
  );
};

export default LoginPage;