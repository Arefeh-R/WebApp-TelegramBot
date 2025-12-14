// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// ==============================|| AUTH LIBRARY BACKGROUND ||============================== //

export default function AuthBackground() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        filter: 'blur(4px)',
        zIndex: -1,
        bottom: 0,
        top: 0,
        left: 0,
        right: 0,
        transform: 'inherit',
        opacity: 0.6
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        {/* Background gradient */}
        <defs>
          <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.vars.palette.primary.lighter} stopOpacity="0.3" />
            <stop offset="50%" stopColor={theme.vars.palette.secondary.lighter} stopOpacity="0.2" />
            <stop offset="100%" stopColor={theme.vars.palette.primary.light} stopOpacity="0.3" />
          </linearGradient>
          
          <linearGradient id="book-gradient-1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.vars.palette.primary.main} stopOpacity="0.7" />
            <stop offset="100%" stopColor={theme.vars.palette.primary.dark} stopOpacity="0.9" />
          </linearGradient>
          
          <linearGradient id="book-gradient-2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.vars.palette.secondary.main} stopOpacity="0.7" />
            <stop offset="100%" stopColor={theme.vars.palette.secondary.dark} stopOpacity="0.9" />
          </linearGradient>
          
          <linearGradient id="book-gradient-3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.vars.palette.success.main} stopOpacity="0.6" />
            <stop offset="100%" stopColor={theme.vars.palette.success.dark} stopOpacity="0.8" />
          </linearGradient>
          
          <linearGradient id="book-gradient-4" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.vars.palette.warning.main} stopOpacity="0.6" />
            <stop offset="100%" stopColor={theme.vars.palette.warning.dark} stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Background fill */}
        <rect width="1200" height="800" fill="url(#bg-gradient)" />

        {/* Large decorative books - left side */}
        <g opacity="0.8">
          {/* Book 1 - tall */}
          <rect x="-50" y="150" width="60" height="300" fill="url(#book-gradient-1)" rx="4" />
          <rect x="-48" y="152" width="3" height="296" fill={theme.vars.palette.background.paper} opacity="0.3" />
          <line x1="-25" y1="155" x2="-25" y2="445" stroke={theme.vars.palette.background.paper} strokeWidth="2" opacity="0.2" />
          
          {/* Book 2 - medium */}
          <rect x="20" y="220" width="50" height="250" fill="url(#book-gradient-2)" rx="4" />
          <rect x="22" y="222" width="3" height="246" fill={theme.vars.palette.background.paper} opacity="0.3" />
          
          {/* Book 3 - short */}
          <rect x="80" y="280" width="55" height="200" fill="url(#book-gradient-3)" rx="4" />
          <rect x="82" y="282" width="3" height="196" fill={theme.vars.palette.background.paper} opacity="0.3" />
          
          {/* Book 4 - tilted */}
          <rect x="10" y="500" width="70" height="280" fill="url(#book-gradient-4)" rx="4" transform="rotate(-15 45 640)" />
          <rect x="12" y="502" width="3" height="276" fill={theme.vars.palette.background.paper} opacity="0.3" transform="rotate(-15 45 640)" />
        </g>

        {/* Large decorative books - right side */}
        <g opacity="0.8">
          {/* Book 5 - tall */}
          <rect x="1190" y="100" width="60" height="320" fill="url(#book-gradient-2)" rx="4" />
          <rect x="1192" y="102" width="3" height="316" fill={theme.vars.palette.background.paper} opacity="0.3" />
          
          {/* Book 6 - medium */}
          <rect x="1120" y="180" width="55" height="270" fill="url(#book-gradient-1)" rx="4" />
          <rect x="1122" y="182" width="3" height="266" fill={theme.vars.palette.background.paper} opacity="0.3" />
          
          {/* Book 7 - short */}
          <rect x="1060" y="240" width="50" height="220" fill="url(#book-gradient-4)" rx="4" />
          <rect x="1062" y="242" width="3" height="216" fill={theme.vars.palette.background.paper} opacity="0.3" />
          
          {/* Book 8 - tilted */}
          <rect x="1130" y="480" width="65" height="300" fill="url(#book-gradient-3)" rx="4" transform="rotate(12 1162.5 630)" />
          <rect x="1132" y="482" width="3" height="296" fill={theme.vars.palette.background.paper} opacity="0.3" transform="rotate(12 1162.5 630)" />
        </g>

        {/* Bottom books shelf effect */}
        <g opacity="0.7">
          {/* Book stack 1 */}
          <rect x="200" y="720" width="80" height="15" fill="url(#book-gradient-1)" rx="2" />
          <rect x="190" y="735" width="90" height="18" fill="url(#book-gradient-2)" rx="2" />
          <rect x="210" y="753" width="70" height="16" fill="url(#book-gradient-3)" rx="2" />
          
          {/* Book stack 2 */}
          <rect x="450" y="710" width="75" height="14" fill="url(#book-gradient-4)" rx="2" />
          <rect x="440" y="724" width="85" height="17" fill="url(#book-gradient-1)" rx="2" />
          <rect x="460" y="741" width="65" height="15" fill="url(#book-gradient-2)" rx="2" />
          
          {/* Book stack 3 */}
          <rect x="700" y="725" width="70" height="13" fill="url(#book-gradient-3)" rx="2" />
          <rect x="695" y="738" width="80" height="16" fill="url(#book-gradient-4)" rx="2" />
          <rect x="710" y="754" width="60" height="14" fill="url(#book-gradient-1)" rx="2" />
          
          {/* Book stack 4 */}
          <rect x="920" y="715" width="85" height="15" fill="url(#book-gradient-2)" rx="2" />
          <rect x="910" y="730" width="95" height="18" fill="url(#book-gradient-3)" rx="2" />
          <rect x="930" y="748" width="75" height="16" fill="url(#book-gradient-4)" rx="2" />
        </g>

        {/* Floating book pages/particles */}
        <g opacity="0.5">
          <rect x="300" y="200" width="30" height="40" fill={theme.vars.palette.primary.lighter} rx="2" transform="rotate(25 315 220)" />
          <rect x="800" y="150" width="25" height="35" fill={theme.vars.palette.secondary.lighter} rx="2" transform="rotate(-20 812.5 167.5)" />
          <rect x="500" y="350" width="28" height="38" fill={theme.vars.palette.success.lighter} rx="2" transform="rotate(15 514 369)" />
          <rect x="950" y="400" width="32" height="42" fill={theme.vars.palette.warning.lighter} rx="2" transform="rotate(-30 966 421)" />
          <rect x="250" y="500" width="26" height="36" fill={theme.vars.palette.primary.lighter} rx="2" transform="rotate(35 263 518)" />
          <rect x="650" y="250" width="29" height="39" fill={theme.vars.palette.secondary.lighter} rx="2" transform="rotate(-25 664.5 269.5)" />
        </g>

        {/* Quote marks decoration */}
        <g opacity="0.3">
          <text x="400" y="450" fontSize="200" fill={theme.vars.palette.primary.main} fontFamily="serif" fontWeight="bold">"</text>
          <text x="750" y="600" fontSize="200" fill={theme.vars.palette.secondary.main} fontFamily="serif" fontWeight="bold">"</text>
        </g>
      </svg>
    </Box>
  );
}