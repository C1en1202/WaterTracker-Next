'use client'
import React, { useState, useEffect, useRef } from 'react';
import { GlassWater, Bell, BellOff, Settings, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui';
import { Box, Typography, Badge, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Switch, Grid } from '@mui/material';

// 喝水提醒应用主组件
export default function Home() {
  // 状态管理
  const [currentIntake, setCurrentIntake] = useState<number>(0);
  const [dailyGoal, setDailyGoal] = useState<number>(3000); // 每日目标3000ml
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());
  // 提醒相关状态
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(false);
  const [reminderInterval, setReminderInterval] = useState<number>(60); // 默认60分钟
  const [nextReminder, setNextReminder] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const reminderTimeout = useRef<NodeJS.Timeout | null>(null);

  // 更新当前小时
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000); // 每分钟更新一次
    return () => clearInterval(timer);
  }, []);

  // 设置下一次提醒
  const setNextReminderTime = () => {
    if (!remindersEnabled) return;

    const now = new Date();
    const next = new Date(now.getTime() + reminderInterval * 60000);
    setNextReminder(next.toLocaleTimeString());

    // 清除现有的定时器
    if (reminderTimeout.current) {
      clearTimeout(reminderTimeout.current);
    }

    // 设置新的定时器
    reminderTimeout.current = setTimeout(() => {
      // 这里可以添加提醒逻辑，例如显示通知
      alert('该喝水了！');
      setNextReminderTime(); // 设置下一次提醒
    }, reminderInterval * 60000);
  };

  // 启动/停止提醒
  const toggleReminders = () => {
    setRemindersEnabled(!remindersEnabled);
  };

  // 保存提醒设置到localStorage
  const saveReminderSettings = () => {
    const settings = {
      remindersEnabled,
      reminderInterval
    };
    localStorage.setItem('reminderSettings', JSON.stringify(settings));
  };

  // 从localStorage加载提醒设置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('reminderSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setRemindersEnabled(parsedSettings.remindersEnabled || false);
        setReminderInterval(parsedSettings.reminderInterval || 60);
      }
    }
  }, []);

  // 根据提醒状态更新提醒
  useEffect(() => {
    if (remindersEnabled) {
      setNextReminderTime();
    } else if (reminderTimeout.current) {
      clearTimeout(reminderTimeout.current);
      setNextReminder(null);
    }
    saveReminderSettings();
  }, [remindersEnabled, reminderInterval]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (reminderTimeout.current) {
        clearTimeout(reminderTimeout.current);
      }
    };
  }, []);

  // 添加一杯水
  const addWater = () => {
    const newIntake = currentIntake + 300; // 使用固定值300ml
    setCurrentIntake(newIntake);

    // 保存到localStorage
    const now = new Date().toISOString();
    const updatedData = {
      currentIntake: newIntake,
      lastUpdated: now
    };
    localStorage.setItem('waterIntake', JSON.stringify(updatedData));
    setLastUpdated(now);
  };

  // 重置今日饮水记录
  const resetDailyIntake = () => {
    if (window.confirm('确定要重置今日饮水记录吗？')) {
      setCurrentIntake(0);

      // 保存到localStorage
      const now = new Date().toISOString();
      const updatedData = {
        currentIntake: 0,
        lastUpdated: now
      };
      localStorage.setItem('waterIntake', JSON.stringify(updatedData));
      setLastUpdated(now);
    }
  };

  // 从localStorage加载数据
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('waterIntake');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setCurrentIntake(parsedData.currentIntake || 0);
        setLastUpdated(parsedData.lastUpdated || new Date().toISOString());
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <Typography variant="h4" className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <GlassWater className="text-blue-500" size={28} />
            喝水提醒
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setShowSettings(true)}
            startIcon={<Settings size={18} />}
          >
            设置
          </Button>
        </header>

        <main>
          {/* 进度卡片 */}
          <div className="mb-6 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:text-white rounded-lg p-6">
            <Typography variant="h6" className="text-gray-600 dark:text-gray-300 mb-2">今日进度</Typography>
            <div className="flex justify-between items-end mb-2">
              <Typography variant="h3" className="font-bold text-gray-800 dark:text-white">
                {currentIntake} ml
              </Typography>
              <Typography variant="h6" className="text-gray-500 dark:text-gray-400">
                / {dailyGoal} ml
              </Typography>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${(currentIntake / dailyGoal) * 100}%` }}
              />
            </div>
            <Typography variant="body2" className="text-gray-600 dark:text-gray-300 mb-4">
              完成度: {Math.min(Math.round((currentIntake / dailyGoal) * 100), 100)}%
            </Typography>

            {/* 提醒状态 */}
            <div className="flex items-center justify-between mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
              <div className="flex items-center gap-2">
                {remindersEnabled ? (
                  <Bell className="text-green-500" size={20} />
                ) : (
                  <BellOff className="text-red-500" size={20} />
                )}
                <Typography variant="body2" className="text-gray-700 dark:text-gray-200">
                  提醒: {remindersEnabled ? '已开启' : '已关闭'}
                </Typography>
              </div>
              {remindersEnabled && nextReminder && (
                <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
                  下次提醒: {nextReminder}
                </Typography>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="contained"
                color="primary"
                size="large"
                className="flex-1 bg-blue-500 hover:bg-blue-600"
                onClick={addWater}
                startIcon={<GlassWater size={20} />}
              >
                喝 300 ml
              </Button>
              <Button
                variant="contained"
                color="warning"
                size="large"
                className="flex-1 bg-yellow-500 hover:bg-yellow-600"
                onClick={resetDailyIntake}
              >
                重置今日
              </Button>
            </div>
          </div>

          {/* 今日喝水记录 */}
          <div className="mb-8 shadow-md hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:text-white rounded-lg p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <Typography variant="h6" className="text-gray-600 dark:text-gray-300 font-medium">今日记录</Typography>
              <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString()}
              </Typography>
            </div>
            <Grid container spacing={3} className="mb-6">
              {Array(Math.ceil(currentIntake / 300)).fill(0).map((_, index) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                  <Badge
                    badgeContent={`${(index + 1) * 300} ml`}
                    color={index < Math.ceil(dailyGoal / 300) ? "primary" : "secondary"}
                    className="w-full py-3 px-4"
                    sx={{
                      fontSize: '0.9rem',
                      height: 'auto',
                      borderRadius: '10px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: index < Math.ceil(dailyGoal / 300) ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      '& .MuiBadge-badge': {
                        right: '10px',
                        top: '10px',
                        height: '18px',
                        minWidth: '18px',
                        fontSize: '0.7rem',
                        padding: '0 4px',
                      }
                    }}
                  >
                    <Clock size={16} className="mr-2" />
                    <span suppressHydrationWarning={true}>{new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </Badge>
                </Grid>
              ))}
            </Grid>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400 italic" suppressHydrationWarning={true}>
              最后更新: {new Date(lastUpdated).toLocaleTimeString()}
            </Typography>
          </div>


        </main>

        {/* 设置对话框 */}
        <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
          <DialogTitle className="flex justify-between items-center">
            <span>提醒设置</span>
            <Button onClick={() => setShowSettings(false)} size="small">
              <X size={20} />
            </Button>
          </DialogTitle>
          <DialogContent>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <Typography variant="body1">启用提醒</Typography>
                <Switch
                  checked={remindersEnabled}
                  onChange={toggleReminders}
                  color="primary"
                />
              </div>
            </div>

            {remindersEnabled && (
              <FormControl fullWidth className="mt-4">
                <InputLabel>提醒间隔 (分钟)</InputLabel>
                <Select
                  value={reminderInterval}
                  label="提醒间隔 (分钟)"
                  onChange={(e) => setReminderInterval(Number(e.target.value))}
                >
                  <MenuItem value={30}>30分钟</MenuItem>
                  <MenuItem value={60}>60分钟</MenuItem>
                  <MenuItem value={90}>90分钟</MenuItem>
                  <MenuItem value={120}>120分钟</MenuItem>
                </Select>
              </FormControl>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSettings(false)}>取消</Button>
            <Button onClick={() => setShowSettings(false)} variant="contained" color="primary">
              保存
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
