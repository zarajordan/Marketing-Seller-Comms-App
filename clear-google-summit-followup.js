// Script to clear Post Event Follow-up from Google Summit
// Run this in the browser console

function clearGoogleSummitFollowUp() {
  try {
    const events = JSON.parse(localStorage.getItem('managed_events') || '[]');
    const googleEvent = events.find(e => e.title && e.title.toLowerCase().includes('google summit'));
    
    if (googleEvent) {
      console.log('Found Google Summit event:', googleEvent.title);
      googleEvent.postEventFollowUp = '';
      localStorage.setItem('managed_events', JSON.stringify(events));
      console.log('✅ Cleared Post Event Follow-up from Google Summit');
      console.log('Please refresh the page to see the changes');
    } else {
      console.log('❌ Google Summit event not found');
      console.log('Available events:', events.map(e => e.title));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

clearGoogleSummitFollowUp();

// Made with Bob
