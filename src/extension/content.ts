/**
 * LinkedIn Message Tracker - Content Script
 * Monitors message sending events on LinkedIn and Sales Navigator
 */

console.log('LinkedIn Pulse: Content Script Active');

const isSalesNavigator = window.location.hostname.includes('sales');

function trackMessageSent() {
  const date = new Date().toISOString().split('T')[0];
  
  chrome.runtime.sendMessage({
    type: 'MESSAGE_SENT',
    platform: isSalesNavigator ? 'salesNav' : 'linkedin',
    date: date
  });
}

// Observe for send button clicks
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  
  // LinkedIn Send Button (Standard)
  const isLISend = target.closest('.msg-form__send-button') || 
                   target.classList.contains('msg-form__send-button');
                   
  // Sales Navigator Send Button
  const isSNSend = target.closest('.content-type-messaging-form__send-button') ||
                   target.closest('.message-overlay-form__send-button');

  if (isLISend || isSNSend) {
    console.log('LinkedIn Pulse: Message sent detected via click');
    trackMessageSent();
  }
});

// Also observe for Enter key in message boxes
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    const target = e.target as HTMLElement;
    const isMessageBox = target.classList.contains('msg-form__contenteditable') || 
                        target.getAttribute('role') === 'textbox';
    
    if (isMessageBox) {
      console.log('LinkedIn Pulse: Message sent detected via Enter');
      trackMessageSent();
    }
  }
});
