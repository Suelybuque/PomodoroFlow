// FatigueRecommendations.tsx
import React from 'react';
import './css/FatigueRecommendations.css';

interface FatigueRecommendationsProps {
  ruleCode: 'long-session-over-2-hours' | 'skipped-3-breaks' | 'pomodoro-cycle'; // add more as needed
}

const fatigueTips: Record<FatigueRecommendationsProps['ruleCode'], { message: string; tips: string[] }> = {
  'pomodoro-cycle': {
    message: "You've completed 4 Pomodoros without a long break. Give yourself some care!",
    tips: [
      '🥤 Hydrate: Drink a glass of water.',
      '🧘🏽 Stretch: Move your body for 3–5 minutes.',
      '🌿 Look away from your screen for at least 30 seconds.',
      '🍎 Snack on something healthy.',
      '🧠 Journal one thought before coming back.',
    ],
  },
  'long-session-over-2-hours': {
    message: 'You’ve been focusing for over 2 hours without rest. 😴 Time to pause!',
    tips: [
      '🚶🏽 Take a 10–15 minute walk.',
      '📴 Unplug from all screens temporarily.',
      '🧎🏽 Do a quick prayer or mindfulness practice.',
      '🍵 Make a cup of tea or warm water.',
    ],
  },
  'skipped-3-breaks': {
    message: "You've skipped 3 breaks in a row 😕 Let’s take care of your focus stamina.",
    tips: [
      '🔕 Step away from your workspace.',
      '🎧 Listen to relaxing sounds or a short podcast.',
      '🧹 Tidy up your space to reset mentally.',
      '🌞 Get some fresh air or sunlight.',
    ],
  },
};

const FatigueRecommendations: React.FC<FatigueRecommendationsProps> = ({ ruleCode }) => {
  const content = fatigueTips[ruleCode];

  return (
    <div className="fatigue-recommendations">
      <p>{content.message}</p>
      <ul>
        {content.tips.map((tip, index) => (
          <li key={index}>{tip}</li>
        ))}
      </ul>
      <p className="mini-affirmation">✨ Your brain will thank you for it!</p>
    </div>
  );
};

export default FatigueRecommendations;
