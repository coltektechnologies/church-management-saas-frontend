import { CreateAnnouncementPayload } from './announcementService';

export interface AnnouncementTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  payload: Partial<CreateAnnouncementPayload>;
}

export const ANNOUNCEMENT_TEMPLATES: AnnouncementTemplate[] = [
  {
    id: 'tpl-sunday-service',
    name: 'Sunday Worship Service',
    description: 'Standard template for weekly Sunday service announcements',
    icon: '⛪',
    payload: {
      category: 'Events & Programs',
      priority: 'Medium',
      title: 'Sunday Worship Service - [Date]',
      content:
        'Join us this Sunday for an uplifting time of worship and the Word. \n\nTheme: [Theme]\nSpeaker: [Speaker Name]\nTime: 9:00 AM\n\nCome expectant and invite a friend!',
      audience: ['All Members'],
      status: 'Pending',
    },
  },
  {
    id: 'tpl-prayer-meeting',
    name: 'Prayer Meeting',
    description: 'Call to prayer for the congregation',
    icon: '🙏',
    payload: {
      category: 'Prayer Request',
      priority: 'High',
      title: 'Mid-Week Prayer Meeting',
      content:
        'Let us gather together to seek the face of God.\n\nDate: [Date]\nTime: [Time]\nLocation: Main Auditorium\n\n"For where two or three gather in my name, there am I with them." - Matthew 18:20',
      audience: ['All Members'],
      status: 'Pending',
    },
  },
  {
    id: 'tpl-funeral',
    name: 'Bereavement / Funeral',
    description: 'Announcement for the passing of a church member',
    icon: '🕊️',
    payload: {
      category: 'Funeral/Bereavements',
      priority: 'High',
      title: 'Homegoing of [Name]',
      content:
        'It is with heavy hearts that we announce the passing of [Name]. \n\nFuneral arrangements are as follows:\nDate: [Date]\nTime: [Time]\nLocation: [Location]\n\nPlease keep the family in your prayers during this difficult time.',
      audience: ['All Members'],
      status: 'Pending',
    },
  },
  {
    id: 'tpl-youth-event',
    name: 'Youth Activity',
    description: 'Template for youth group gatherings and events',
    icon: '🔥',
    payload: {
      category: 'Youth Activities',
      priority: 'Medium',
      title: 'Youth Ignite: [Event Name]',
      content:
        "Calling all youth!\n\nJoin us for [Event Name] on [Date] at [Time]. It's going to be a great time of fellowship, games, and digging into the Word.\n\nDon't miss out!",
      audience: ['Youth Group'],
      status: 'Pending',
    },
  },
  {
    id: 'tpl-thanksgiving',
    name: 'Thanksgiving Service',
    description: 'Special thanksgiving or crossover services',
    icon: '🎉',
    payload: {
      category: 'Thanksgiving',
      priority: 'Low',
      title: 'Special Thanksgiving Service',
      content:
        'We have so much to be thankful for! Join us for a special Thanksgiving Service.\n\nDate: [Date]\nTime: [Time]\n\nBring your testimonies and a heart of gratitude!',
      audience: ['All Members'],
      status: 'Pending',
    },
  },
  {
    id: 'tpl-leaders-meeting',
    name: 'Leaders Meeting',
    description: 'Internal announcement for church leadership',
    icon: '👥',
    payload: {
      category: 'Departmental Updates',
      priority: 'High',
      title: 'Mandatory Leaders Meeting',
      content:
        'There will be a mandatory meeting for all church leaders and heads of departments.\n\nDate: [Date]\nTime: [Time]\nAgenda: [Brief Agenda]\n\nPlease be punctual.',
      audience: ['Church Leaders'],
      status: 'Pending',
    },
  },
  {
    id: 'tpl-baptism',
    name: 'Baptism Celebration',
    description: 'Announcement for water baptism services',
    icon: '💧',
    payload: {
      category: 'Baptism Celebration',
      priority: 'Medium',
      title: 'Water Baptism Service',
      content:
        'We are excited to celebrate new life in Christ!\n\nJoin us for our upcoming Water Baptism Service:\nDate: [Date]\nTime: [Time]\nLocation: [Location]\n\nIf you would like to be baptized, please register at the church office by [Deadline].',
      audience: ['All Members'],
      status: 'Pending',
    },
  },
  {
    id: 'tpl-wedding',
    name: 'Wedding Invitation',
    description: 'Announcement for church member weddings',
    icon: '💍',
    payload: {
      category: 'Weddings',
      priority: 'Low',
      title: 'Wedding Journey: [Couple Names]',
      content:
        'We rejoice with [Partner 1] and [Partner 2] as they tie the knot!\n\nThe church family is cordially invited to witness their holy matrimony:\nDate: [Date]\nTime: [Time]\nLocation: [Venue]\n\nLet us come out in our numbers to celebrate with them.',
      audience: ['All Members'],
      status: 'Pending',
    },
  },
  {
    id: 'tpl-health',
    name: 'Health & Wellness',
    description: 'Health screening or wellness seminar announcement',
    icon: '⚕️',
    payload: {
      category: 'Health and Wellness',
      priority: 'Medium',
      title: 'Free Health Screening & Seminar',
      content:
        "Your health is your wealth!\n\nThe Medical Team is organizing a free health screening and wellness seminar for all members.\n\nDate: [Date]\nTime: [Time]\nVenue: [Location]\nActivities: Blood pressure check, BMI, Consultation, and more.\n\nDon't miss this opportunity to prioritize your well-being!",
      audience: ['All Members'],
      status: 'Pending',
    },
  },
  {
    id: 'tpl-community',
    name: 'Community Outreach',
    description: 'Volunteer call for community service',
    icon: '🤝',
    payload: {
      category: 'Community Outreach',
      priority: 'High',
      title: 'Volunteer Call: [Outreach Name]',
      content:
        'It is time to be the hands and feet of Jesus in our community!\n\nWe are organizing a mass outreach to [Location/Target Group].\n\nDate: [Date]\nMeeting Point: [Location]\nTime: [Time]\n\nWe need volunteers for evangelism, medical aid, and welfare distribution. Please sign up at the information desk.',
      audience: ['All Members'],
      status: 'Pending',
    },
  },
  {
    id: 'tpl-birthday',
    name: 'Birthday Wishes',
    description: 'Monthly birthday celebrants announcement',
    icon: '🎂',
    payload: {
      category: 'Birthday Wishes',
      priority: 'Low',
      title: 'Happy Birthday: [Month] Celebrants!',
      content:
        "We want to wish a very Happy Birthday to all our wonderful members born in the month of [Month]!\n\nMay God crown your new year with His goodness and grant you your heart's desires. We love and celebrate you!\n\n[Optional: List of Staff/Leader Celebrants]",
      audience: ['All Members'],
      status: 'Pending',
    },
  },
  {
    id: 'tpl-general',
    name: 'General Update',
    description: 'Standard template for general church information',
    icon: '📢',
    payload: {
      category: 'General Church',
      priority: 'Medium',
      title: '[Important Update Topic]',
      content:
        'Dear Church Family,\n\nPlease bear in mind the following important update regarding [Topic].\n\n[Details of the update...]\n\nThank you for your understanding and cooperation.\n\nGod bless you!',
      audience: ['All Members'],
      status: 'Pending',
    },
  },
];
