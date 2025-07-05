
export interface Team {
  id: number;
  name: string;
  shortName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
}

export const premierLeagueTeams: Team[] = [
  { id: 1, name: "Arsenal", shortName: "ARS", logo: "🔴", primaryColor: "#DC143C", secondaryColor: "#FFFFFF" },
  { id: 2, name: "Aston Villa", shortName: "AVL", logo: "🟣", primaryColor: "#95BFE5", secondaryColor: "#670E36" },
  { id: 3, name: "Bournemouth", shortName: "BOU", logo: "🍒", primaryColor: "#DA020E", secondaryColor: "#000000" },
  { id: 4, name: "Brentford", shortName: "BRE", logo: "🐝", primaryColor: "#E30613", secondaryColor: "#FFD700" },
  { id: 5, name: "Brighton", shortName: "BHA", logo: "🔵", primaryColor: "#0057B8", secondaryColor: "#FFD700" },
  { id: 6, name: "Chelsea", shortName: "CHE", logo: "💙", primaryColor: "#034694", secondaryColor: "#FFFFFF" },
  { id: 7, name: "Crystal Palace", shortName: "CRY", logo: "🦅", primaryColor: "#1B458F", secondaryColor: "#A7A5A6" },
  { id: 8, name: "Everton", shortName: "EVE", logo: "🔷", primaryColor: "#003399", secondaryColor: "#FFFFFF" },
  { id: 9, name: "Fulham", shortName: "FUL", logo: "⚪", primaryColor: "#FFFFFF", secondaryColor: "#000000" },
  { id: 10, name: "Ipswich Town", shortName: "IPS", logo: "🟦", primaryColor: "#4C9FE0", secondaryColor: "#FFFFFF" },
  { id: 11, name: "Leicester City", shortName: "LEI", logo: "🦊", primaryColor: "#003090", secondaryColor: "#FFD700" },
  { id: 12, name: "Liverpool", shortName: "LIV", logo: "❤️", primaryColor: "#C8102E", secondaryColor: "#FFD700" },
  { id: 13, name: "Manchester City", shortName: "MCI", logo: "💙", primaryColor: "#6CABDD", secondaryColor: "#1C2C5B" },
  { id: 14, name: "Manchester United", shortName: "MUN", logo: "🔴", primaryColor: "#DA020E", secondaryColor: "#FFE500" },
  { id: 15, name: "Newcastle United", shortName: "NEW", logo: "⚫", primaryColor: "#241F20", secondaryColor: "#FFFFFF" },
  { id: 16, name: "Nottingham Forest", shortName: "NFO", logo: "🌳", primaryColor: "#DD0000", secondaryColor: "#FFFFFF" },
  { id: 17, name: "Southampton", shortName: "SOU", logo: "🔴", primaryColor: "#D71920", secondaryColor: "#130C0E" },
  { id: 18, name: "Tottenham", shortName: "TOT", logo: "⚪", primaryColor: "#132257", secondaryColor: "#FFFFFF" },
  { id: 19, name: "West Ham United", shortName: "WHU", logo: "⚒️", primaryColor: "#7A263A", secondaryColor: "#F3D459" },
  { id: 20, name: "Wolverhampton", shortName: "WOL", logo: "🐺", primaryColor: "#FDB913", secondaryColor: "#231F20" }
];
