import apiClient from "../services/apiClient";

/**
 * Helper: Parse Bitrix Date (DD/MM/YYYY HH:MM:SS am/pm)
 * Converts a specific Bitrix date string format into a JavaScript Date object.
 */
export const parseBitrixDate = (dateString) => {
  if (!dateString) return null;
  try {
    const [datePart, timePart, meridian] = dateString.split(' ');
    if (!datePart) return new Date();

    const [day, month, year] = datePart.split('/').map(Number);
    let [hours, minutes, seconds] = timePart ? timePart.split(':').map(Number) : [0, 0, 0];

    if (meridian) {
      const isPM = meridian.toLowerCase() === 'pm';
      const isAM = meridian.toLowerCase() === 'am';
      if (isPM && hours < 12) hours += 12; // 1 PM to 11 PM
      if (isAM && hours === 12) hours = 0;  // 12 AM (midnight)
    }

    return new Date(year, month - 1, day, hours, minutes, seconds);
  } catch (e) {
    console.error("Date Parse Error:", e);
    return new Date(); 
  }
};

/**
 * Helper function to calculate time elapsed ('time ago') for critical tasks.
 * @param {string} isoDateString 
 * @returns {string} 
 */
export const calculateTimeAgo = (isoDateString) => {
    if (!isoDateString) return "Just now";
    const past = new Date(isoDateString);
    const now = new Date();
    const diffSeconds = Math.floor((now - past) / 1000);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
};

/**
 * Fetches all active users from Bitrix, calculates their next birthday,
 */
export const getBitrixUpcomingBirthdays = async (lookaheadDays = 365) => {
    try {
        const now = new Date();
        
        const response = await apiClient.get("user.get", {
            params: {
                FILTER: { ACTIVE: true },
                SELECT: ["ID", "NAME", "LAST_NAME", "PERSONAL_BIRTHDAY"] 
            }
        });

        const users = response.data.result || [];
        const upcomingBirthdays = [];
        
        
        for (const user of users) {
            if (!user.PERSONAL_BIRTHDAY) continue;
            
            const datePart = user.PERSONAL_BIRTHDAY.split('T')[0];
            
            const [year, month, day] = datePart.split('-').map(Number);
            let nextBday = new Date(now.getFullYear(), month - 1, day);
            
            if (nextBday < now) {
                nextBday = new Date(now.getFullYear() + 1, month - 1, day);
            }
            
            const diffMs = nextBday - now;
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)); 
            

            if (diffDays <= lookaheadDays && diffDays >= 0) {
                const fullName = `${user.NAME} ${user.LAST_NAME}`.trim();
                
                upcomingBirthdays.push({
                    id: `bday_${user.ID}`, 
                    event: `${fullName}'s Birthday`,
                    time: nextBday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    icon: '🎂', 
                    parsedDate: nextBday 
                });
            }
        }
        

        return upcomingBirthdays;

    } catch (error) {
        console.error("Failed to fetch upcoming birthdays", error);
        return [];
    }
};