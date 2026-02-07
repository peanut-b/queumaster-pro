

export const announceTicket = async (ticketNumber: string, tellerName: string) => {
  try {
    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Format ticket number for better pronunciation
    // Add spaces between characters for clearer announcement
    const spacedTicketNumber = ticketNumber.split('').join(' ');
    
    // Create announcement message
    const message = new SpeechSynthesisUtterance();
    message.text = `Ticket number ${spacedTicketNumber}, please proceed to ${tellerName}.`;
    
    // Configure voice settings
    message.rate = 0.9; // Slightly slower for clarity
    message.pitch = 1.0;
    message.volume = 1.0;
    
    // Try to use a female voice if available (usually clearer for announcements)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.includes('en') && voice.name.includes('Female')
    ) || voices.find(voice => voice.lang.includes('en'));
    
    if (preferredVoice) {
      message.voice = preferredVoice;
    }
    
    // Speak the announcement
    window.speechSynthesis.speak(message);
    
    // Return a promise that resolves when speech is complete
    return new Promise<void>((resolve) => {
      message.onend = () => resolve();
      message.onerror = () => resolve();
    });
    
  } catch (error) {
    console.error("Voice announcement failed:", error);
  }
};

/**
 * Preload voices - call this on app initialization
 */
export const initializeSpeech = () => {
  // Load voices when they become available
  if ('speechSynthesis' in window) {
    // Some browsers need this to populate voices
    window.speechSynthesis.getVoices();
    
    // Chrome needs voiceschanged event
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Voices are now loaded
        console.log('Speech voices loaded');
      };
    }
  }
};
