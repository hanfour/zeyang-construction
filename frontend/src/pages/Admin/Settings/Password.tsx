import React, { useState } from 'react';
import { 
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import authService from '@/services/auth.service';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const AdminPasswordSettings: React.FC = () => {
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: keyof PasswordFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('密碼長度至少需要8個字元');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('密碼必須包含至少一個大寫字母');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('密碼必須包含至少一個小寫字母');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('密碼必須包含至少一個數字');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('密碼必須包含至少一個特殊字元');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.currentPassword) {
      toast.error('請輸入目前密碼');
      return;
    }
    
    if (!formData.newPassword) {
      toast.error('請輸入新密碼');
      return;
    }
    
    if (!formData.confirmPassword) {
      toast.error('請確認新密碼');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('新密碼與確認密碼不一致');
      return;
    }
    
    if (formData.currentPassword === formData.newPassword) {
      toast.error('新密碼不能與目前密碼相同');
      return;
    }
    
    // Password strength validation
    const passwordErrors = validatePassword(formData.newPassword);
    if (passwordErrors.length > 0) {
      toast.error(passwordErrors[0]);
      return;
    }
    
    try {
      setLoading(true);
      await authService.changePassword(formData.currentPassword, formData.newPassword);
      toast.success('密碼修改成功');
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Password change error:', error);
      // Error is handled by API client
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = formData.newPassword ? validatePassword(formData.newPassword) : [];
  const isPasswordValid = passwordStrength.length === 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">密碼設定</h1>
        <p className="mt-2 text-gray-600">修改您的登入密碼</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <KeyIcon className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">修改密碼</h2>
          </div>

          <div className="space-y-6">
            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                目前密碼 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className="w-full h-12 !pr-12 !pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none"
                  placeholder="請輸入目前的密碼"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-primary-more" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-primary-more" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                新密碼 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className="w-full h-12 !pr-12 !pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none"
                  placeholder="請輸入新密碼"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-primary-more" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-primary-more" />
                  )}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {formData.newPassword && (
                <div className="mt-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 text-sm">
                      <div className={`flex items-center ${formData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircleIcon className={`h-4 w-4 mr-1 ${formData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}`} />
                        至少8個字元
                      </div>
                      <div className={`flex items-center ${/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircleIcon className={`h-4 w-4 mr-1 ${/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`} />
                        大寫字母
                      </div>
                      <div className={`flex items-center ${/[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircleIcon className={`h-4 w-4 mr-1 ${/[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`} />
                        小寫字母
                      </div>
                      <div className={`flex items-center ${/[0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircleIcon className={`h-4 w-4 mr-1 ${/[0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`} />
                        數字
                      </div>
                      <div className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircleIcon className={`h-4 w-4 mr-1 ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`} />
                        特殊字元
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                確認新密碼 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full h-12 !pr-12 !pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none"
                  placeholder="請再次輸入新密碼"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-primary-more" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-primary-more" />
                  )}
                </button>
              </div>
              
              {/* Password match indicator */}
              {formData.confirmPassword && (
                <div className="mt-2">
                  {formData.newPassword === formData.confirmPassword ? (
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      密碼一致
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600 text-sm">
                      <span className="h-4 w-4 mr-1 text-center">✗</span>
                      密碼不一致
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="text-sm font-medium text-amber-800 mb-2">密碼安全提醒</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 請使用強密碼以保護您的帳戶安全</li>
              <li>• 不要使用個人資訊作為密碼</li>
              <li>• 定期更換密碼，避免重複使用舊密碼</li>
              <li>• 不要與他人分享您的密碼</li>
            </ul>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading || !isPasswordValid || formData.newPassword !== formData.confirmPassword}
            className="bg-primary-more text-white px-16 py-4 text-content-mobile lg:text-content-desktop font-medium tracking-wider hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" className="mr-2" />
                修改中...
              </>
            ) : (
              '修改密碼'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPasswordSettings;