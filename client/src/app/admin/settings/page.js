'use client';
import { useState } from 'react';
import { 
  FiSettings, 
  FiShield, 
  FiBell, 
  FiDatabase,
  FiMail,
  FiUser,
  FiGlobe
} from 'react-icons/fi';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // System Settings
    maintenanceMode: false,
    userRegistration: true,
    reportAnonymous: true,
    
    // Security Settings
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordPolicy: 'strong',
    
    // Notification Settings
    emailNotifications: true,
    systemAlerts: true,
    reportUpdates: true,
    
    // Privacy Settings
    dataRetention: 365,
    analyticsTracking: true,
    thirdPartySharing: false
  });

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black">System Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure platform-wide settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FiSettings className="text-orange-500" />
            <h2 className="text-lg font-semibold text-black">System Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-black">Maintenance Mode</h3>
                <p className="text-sm text-gray-600">Temporarily disable the platform</p>
              </div>
              <button
                onClick={() => handleSettingChange('maintenanceMode', !settings.maintenanceMode)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.maintenanceMode ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`${
                    settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-black">User Registration</h3>
                <p className="text-sm text-gray-600">Allow new user registrations</p>
              </div>
              <button
                onClick={() => handleSettingChange('userRegistration', !settings.userRegistration)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.userRegistration ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`${
                    settings.userRegistration ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-black">Anonymous Reporting</h3>
                <p className="text-sm text-gray-600">Allow anonymous incident reports</p>
              </div>
              <button
                onClick={() => handleSettingChange('reportAnonymous', !settings.reportAnonymous)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.reportAnonymous ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`${
                    settings.reportAnonymous ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FiShield className="text-orange-500" />
            <h2 className="text-lg font-semibold text-black">Security Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-black">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">Require 2FA for all admins</p>
              </div>
              <button
                onClick={() => handleSettingChange('twoFactorAuth', !settings.twoFactorAuth)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.twoFactorAuth ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`${
                    settings.twoFactorAuth ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                min="5"
                max="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Policy
              </label>
              <select
                value={settings.passwordPolicy}
                onChange={(e) => handleSettingChange('passwordPolicy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="basic">Basic</option>
                <option value="medium">Medium</option>
                <option value="strong">Strong</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FiBell className="text-orange-500" />
            <h2 className="text-lg font-semibold text-black">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            {['emailNotifications', 'systemAlerts', 'reportUpdates'].map((setting) => (
              <div key={setting} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-black capitalize">
                    {setting.replace(/([A-Z])/g, ' $1')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {setting === 'emailNotifications' && 'Send email notifications'}
                    {setting === 'systemAlerts' && 'Receive system alerts'}
                    {setting === 'reportUpdates' && 'Get report status updates'}
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange(setting, !settings[setting])}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings[setting] ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`${
                      settings[setting] ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FiDatabase className="text-orange-500" />
            <h2 className="text-lg font-semibold text-black">Privacy & Data</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Retention (days)
              </label>
              <input
                type="number"
                value={settings.dataRetention}
                onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                min="30"
                max="1095"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-black">Analytics Tracking</h3>
                <p className="text-sm text-gray-600">Collect usage analytics</p>
              </div>
              <button
                onClick={() => handleSettingChange('analyticsTracking', !settings.analyticsTracking)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.analyticsTracking ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`${
                    settings.analyticsTracking ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-black">Third-Party Sharing</h3>
                <p className="text-sm text-gray-600">Share data with partners</p>
              </div>
              <button
                onClick={() => handleSettingChange('thirdPartySharing', !settings.thirdPartySharing)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.thirdPartySharing ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`${
                    settings.thirdPartySharing ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
          Reset to Default
        </button>
        <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}