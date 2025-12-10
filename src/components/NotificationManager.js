import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';

export default function useNotificationManager(transactions, budget) {
  const lastBudgetAlert = useRef(null);
  const lastSubscriptionCheck = useRef(null);

  useEffect(() => {
    // Request permission
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!budget) return;

    // Calculate total expenses for current month
    const now = dayjs();
    const currentMonthExpenses = transactions
      .filter(t => t.type === 'expense' && dayjs(t.date).isSame(now, 'month'))
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const percentage = (currentMonthExpenses / budget) * 100;

    // Alert if > 80% and haven't alerted today
    if (percentage >= 80) {
      const todayStr = now.format('YYYY-MM-DD');
      if (lastBudgetAlert.current !== todayStr) {
        sendNotification(
          "Budget Alert", 
          `You have used ${percentage.toFixed(0)}% of your monthly budget (₹${currentMonthExpenses} / ₹${budget}).`
        );
        lastBudgetAlert.current = todayStr;
      }
    }
  }, [transactions, budget]);

  useEffect(() => {
    // Check subscriptions
    const now = dayjs();
    const todayStr = now.format('YYYY-MM-DD');
    
    if (lastSubscriptionCheck.current === todayStr) return;

    const tomorrow = now.add(1, 'day');

    transactions.forEach(t => {
      if (t.isSubscription && t.renewalDate) {
        const renewal = dayjs(t.renewalDate);
        if (renewal.isSame(tomorrow, 'day')) {
          sendNotification(
            "Subscription Renewal", 
            `Your subscription for ${t.note || 'Unknown'} renews tomorrow!`
          );
        }
      }
    });

    lastSubscriptionCheck.current = todayStr;
  }, [transactions]);

  const sendNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: '/logo192.png' });
    } else {
      console.log("Notification permission not granted", title, body);
    }
  };
}
