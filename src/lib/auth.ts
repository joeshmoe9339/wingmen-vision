export type Role = 'admin' | 'president' | 'vp' | 'saa' | 'monitoring' | 'base';

export interface User {
  username: string;
  name: string;
  role: Role;
}

export interface DeviceRequest {
  id: string;
  username: string;
  deviceId: string;
  status: 'pending' | 'code_generated' | 'approved';
  code?: string;
  timestamp: number;
}

const USERS: Record<string, { password: string; user: User }> = {
  admin: { password: 'password', user: { username: 'admin', name: 'System Administrator', role: 'admin' } },
  president: { password: 'password', user: { username: 'president', name: 'President', role: 'president' } },
  vp: { password: 'password', user: { username: 'vp', name: 'Vice President', role: 'vp' } },
  saa: { password: 'password', user: { username: 'saa', name: 'Sergeant at Arms', role: 'saa' } },
  monitoring: { password: 'password', user: { username: 'monitoring', name: 'Monitoring Provisioning', role: 'monitoring' } },
  base: { password: 'password', user: { username: 'base', name: 'Main Server Base', role: 'base' } },
};

export const getDeviceId = () => {
  let id = localStorage.getItem('omnisight_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('omnisight_device_id', id);
  }
  return id;
};

const getCustomPasswords = () => JSON.parse(localStorage.getItem('custom_passwords') || '{}');
const getMonitoringAccounts = () => JSON.parse(localStorage.getItem('monitoring_accounts') || '[]');

export const authApi = {
  login: async (username: string, password: string): Promise<{ user?: User; requireCode?: boolean; error?: string }> => {
    const deviceId = getDeviceId();
    const customPasswords = getCustomPasswords();
    const monitoringAccounts = getMonitoringAccounts();

    // 1. Check if it's an M1-M10 account
    if (username.toUpperCase().match(/^M([1-9]|10)$/)) {
      const mAcc = monitoringAccounts.find((a: any) => a.username === username.toUpperCase());
      if (!mAcc || mAcc.password !== password) return { error: 'Invalid credentials' };
      if (mAcc.deviceId !== deviceId) return { error: 'Security Lockout: This account is locked to its original authorized device. Access denied.' };
      return { user: mAcc.user };
    }

    // 2. Standard user check
    const record = USERS[username.toLowerCase()];
    if (!record) return { error: 'Invalid username or password' };

    // Admin bypass: always accept default admin password
    const activePassword = (username.toLowerCase() === 'admin' && password === 'password') ? 'password' : (customPasswords[username.toLowerCase()] || record.password);
    if (activePassword !== password) return { error: 'Invalid username or password' };

    const user = record.user;

    // Admin and Base bypass device approval
    if (user.role === 'admin' || user.role === 'base') {
      return { user };
    }

    // Check if device is already approved
    const approved = JSON.parse(localStorage.getItem('approved_devices') || '[]');
    if (approved.some((d: any) => d.username === user.username && d.deviceId === deviceId)) {
      return { user };
    }

    // Check device limits
    const userDevices = approved.filter((d: any) => d.username === user.username);
    const maxDevices = user.role === 'monitoring' ? 10 : 3;
    if (userDevices.length >= maxDevices) {
      return { error: `Device limit reached. Maximum ${maxDevices} devices allowed for this role.` };
    }

    // Create a pending request
    const requests: DeviceRequest[] = JSON.parse(localStorage.getItem('device_requests') || '[]');
    const existing = requests.find(r => r.username === user.username && r.deviceId === deviceId);
    
    if (!existing) {
      requests.push({
        id: 'req_' + Math.random().toString(36).substr(2, 9),
        username: user.username,
        deviceId,
        status: 'pending',
        timestamp: Date.now()
      });
      localStorage.setItem('device_requests', JSON.stringify(requests));
    }

    return { requireCode: true };
  },

  verifyCode: async (username: string, code: string): Promise<{ user?: User; newCredentials?: {username: string, password: string}; error?: string }> => {
    const deviceId = getDeviceId();
    const requests: DeviceRequest[] = JSON.parse(localStorage.getItem('device_requests') || '[]');
    const request = requests.find(r => r.username === username && r.deviceId === deviceId);

    if (!request || request.code !== code) {
      return { error: 'Invalid or expired access code.' };
    }

    // Remove request
    localStorage.setItem('device_requests', JSON.stringify(requests.filter(r => r.id !== request.id)));

    // Special logic for monitoring: generate M1-M10
    if (username === 'monitoring') {
      const mAccounts = getMonitoringAccounts();
      if (mAccounts.length >= 10) return { error: 'Max 10 monitoring stations reached.' };
      
      let mNum = 1;
      while(mAccounts.some((a:any) => a.username === `M${mNum}`)) mNum++;
      
      const newUsername = `M${mNum}`;
      const newPassword = Math.random().toString(36).slice(-8);
      const newUser: User = { username: newUsername, name: `Monitoring Station ${mNum}`, role: 'monitoring' };
      
      mAccounts.push({ username: newUsername, password: newPassword, deviceId, user: newUser });
      localStorage.setItem('monitoring_accounts', JSON.stringify(mAccounts));
      
      return { user: newUser, newCredentials: { username: newUsername, password: newPassword } };
    }

    // Standard approval
    const approved = JSON.parse(localStorage.getItem('approved_devices') || '[]');
    approved.push({ username, deviceId, timestamp: Date.now() });
    localStorage.setItem('approved_devices', JSON.stringify(approved));

    return { user: USERS[username].user };
  },

  changePassword: async (username: string, oldPass: string, newPass: string) => {
    const customPasswords = getCustomPasswords();
    const monitoringAccounts = getMonitoringAccounts();

    if (username.toUpperCase().match(/^M([1-9]|10)$/)) {
      const mIdx = monitoringAccounts.findIndex((a:any) => a.username === username.toUpperCase());
      if (mIdx >= 0 && monitoringAccounts[mIdx].password === oldPass) {
        monitoringAccounts[mIdx].password = newPass;
        localStorage.setItem('monitoring_accounts', JSON.stringify(monitoringAccounts));
        return { success: true };
      }
      return { error: 'Invalid old password' };
    }

    const record = USERS[username.toLowerCase()];
    if (!record) return { error: 'User not found' };
    
    const activePassword = customPasswords[username.toLowerCase()] || record.password;
    if (activePassword !== oldPass) return { error: 'Invalid old password' };

    customPasswords[username.toLowerCase()] = newPass;
    localStorage.setItem('custom_passwords', JSON.stringify(customPasswords));
    return { success: true };
  },

  getPendingRequests: (): DeviceRequest[] => {
    return JSON.parse(localStorage.getItem('device_requests') || '[]');
  },

  generateCodeForRequest: (requestId: string): string => {
    const requests: DeviceRequest[] = JSON.parse(localStorage.getItem('device_requests') || '[]');
    const req = requests.find(r => r.id === requestId);
    if (req) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      req.code = code;
      req.status = 'code_generated';
      localStorage.setItem('device_requests', JSON.stringify(requests));
      return code;
    }
    return '';
  },

  getApprovedDevices: () => {
    return JSON.parse(localStorage.getItem('approved_devices') || '[]');
  },

  revokeDevice: (username: string, deviceId: string) => {
    const approved = JSON.parse(localStorage.getItem('approved_devices') || '[]');
    localStorage.setItem('approved_devices', JSON.stringify(approved.filter((d: any) => !(d.username === username && d.deviceId === deviceId))));
  }
};