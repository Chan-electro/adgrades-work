
export interface ServiceItem {
    name: string;
    description?: string;
    items?: string[];
    price?: number; // Optional individual price for calculation
    category?: string;
}

export interface PackageDef {
    id: string;
    name: string;
    price: number;
    saveAmount?: string;
    description: string;
    idealFor: string;
    color: string;
    outcome: string;
    services: ServiceItem[];
}

export const INDIVIDUAL_SERVICES: ServiceItem[] = [
    // Social Media Management
    {
        name: 'SMMA Basic',
        price: 12999,
        description: 'Single platform focus',
        items: ['1 Platform', '12 Static Posts', '8 Stories', '15min/day Community Mgmt', 'Monthly Report'],
        category: 'Social Media Management'
    },
    {
        name: 'SMMA Pro',
        price: 26999,
        description: 'Multi-platform growth',
        items: ['2 Platforms', '16 Static Posts (4 A/B tests)', '12 Stories', '30min/day Community Mgmt', '2 Strategy Calls'],
        category: 'Social Media Management'
    },
    {
        name: 'SMMA Superb',
        price: 42999,
        description: 'Aggressive growth & strategy',
        items: ['3 Platforms', '20 Static Posts', '16 Stories', 'Experimental Content Lab', 'Weekly Strategy Calls'],
        category: 'Social Media Management'
    },

    // Video Editing (Bundles)
    {
        name: '4 Basic Reels (<60s)',
        price: 6000,
        description: 'Essential short-form pack',
        items: ['Clean cuts', 'Basic captions', 'Logo outro', '1 Revision'],
        category: 'Video Editing'
    },
    {
        name: '8 Basic Reels (<60s)',
        price: 12000,
        description: 'Volume short-form pack',
        items: ['Clean cuts', 'Basic captions', 'Batch production', '1 Revision'],
        category: 'Video Editing'
    },
    {
        name: '4 Intermediate Reels',
        price: 14000,
        description: 'Enhanced editing pack',
        items: ['Motion graphics', 'Dynamic captions', 'SFX & Transitions', '2 Revisions'],
        category: 'Video Editing'
    },
    {
        name: 'Commercial Ad',
        price: 25000,
        description: 'High-impact promo (Post-production)',
        items: ['Script & Shot list', 'Color grading', 'Sound design', '15s Cutdown included'],
        category: 'Video Editing'
    },
    {
        name: 'Explainer Video (1 min)',
        price: 20000,
        description: '2D Motion/Animated',
        items: ['Scriptwriting', 'Voice Over direction', 'Custom assets', 'Full HD Master'],
        category: 'Video Editing'
    },

    // Performance Marketing
    {
        name: 'Ads Basic',
        price: 18000,
        description: 'Meta or Google (Spend < ₹40k)',
        items: ['1 Platform', '3 Campaigns', 'Weekly Optimization', 'Monthly Report'],
        category: 'Performance Marketing'
    },
    {
        name: 'Ads Pro',
        price: 30000,
        description: 'Meta & Google (Spend < ₹80k)',
        items: ['2 Platforms', '4 Campaigns', '1-2 Experiments/mo', 'Basic Funnel Setup'],
        category: 'Performance Marketing'
    },
    {
        name: 'Ads Superb',
        price: 50000,
        description: 'Full Scale (Spend < ₹1.2L)',
        items: ['Both Platforms', '6 Campaigns', 'High-volume Creative Testing', 'Real-time Dashboard'],
        category: 'Performance Marketing'
    },

    // Website Development
    {
        name: 'Website Basic',
        price: 19999,
        description: '5-Page Responsive Site',
        items: ['Home, About, Services, Contact', 'Basic SEO', 'Lead Form', 'Maintenance: ₹1,500/mo extra'],
        category: 'Website Development'
    },
    {
        name: 'Website Standard (CMS)',
        price: 34999,
        description: '10-Page CMS Enabled',
        items: ['Blog/CMS', '2 Integrations', 'Component Library', 'Maintenance: ₹2,500/mo extra'],
        category: 'Website Development'
    },
    {
        name: 'Website Premium',
        price: 59999,
        description: '20-Page Custom Experience',
        items: ['Advanced Interactions', '4 Integrations', 'Adv. SEO', 'Maintenance: ₹3,500/mo extra'],
        category: 'Website Development'
    },
    {
        name: 'E-commerce Launch',
        price: 74999,
        description: 'Full Online Store Setup',
        items: ['100 SKUs', 'Payment & Shipping', 'CRO Template', 'Maintenance: ₹6,000/mo + 2% sales'],
        category: 'Website Development'
    }
];

export const PACKAGES: PackageDef[] = [
    {
        id: 'brand-kickstart',
        name: 'Brand Kickstart',
        price: 47999,
        saveAmount: 'Save ₹3,000',
        description: 'New or growing brands that need consistent social presence, basic video content, and a steady ad engine.',
        idealFor: 'New or growing brands',
        color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
        outcome: 'A complete brand foundation—consistent content, professional social presence, and optimised ads to kickstart growth.',
        services: [
            { name: 'SMMA Pro', description: 'End-to-end management', items: ['Strategy, posts, scheduling, reporting', 'Monthly content calendar', 'Caption writing + optimized hashtags', 'Community management'] },
            { name: '4 Basic Reels', description: 'Clean basic edits', items: ['Upto 60 seconds', 'Music syncing', 'Simple captions', 'Fast delivery'] },
            { name: 'Performance Marketing Basic', description: 'Meta/Google ads', items: ['Weekly optimization', 'Basic A/B testing', 'Monthly KPI report', 'Ad spend ≤ ₹40,000'] }
        ]
    },
    {
        id: 'growth-engine',
        name: 'Growth Engine',
        price: 74999,
        saveAmount: 'Save ₹3,000',
        description: 'Brands focused on scaling both organic and paid growth with stronger video content and advanced ad management.',
        idealFor: 'Scaling brands (Organic + Paid)',
        color: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
        outcome: 'A month-on-month scaling engine for brands ready to push reach, revenue, and engagement.',
        services: [
            { name: 'SMMA Pro', description: 'All features from Brand Kickstart', items: ['Pro level features'] },
            { name: '6 Intermediate Reels', description: 'Higher-quality edits', items: ['Creative transitions', 'Styled captions', 'Music + basic color grading'] },
            { name: 'Performance Marketing Pro', description: 'Advanced setup', items: ['Multi-campaign setup', 'Deeper A/B testing', 'Funnel optimization', 'Weekly strategy call'] }
        ]
    },
    {
        id: 'performance-plus',
        name: 'Performance+',
        price: 60999,
        saveAmount: 'Save ₹3,000',
        description: 'Brands whose primary goal is strong ROI through ads, complemented by light social and video support.',
        idealFor: 'ROI focused brands',
        color: 'bg-green-500/10 text-green-700 dark:text-green-300',
        outcome: 'Strong ad performance with just enough content support to maintain consistency and credibility.',
        services: [
            { name: 'Performance Marketing Superb', description: 'Multi-channel ads', items: ['Meta + Google', 'Aggressive testing', 'Attribution hygiene (GA4)', 'Monthly insights'] },
            { name: 'SMMA Basic', description: '8–12 posts/month', items: ['Content scheduling', 'Captions + hashtags', 'Monthly insights'] },
            { name: '4 Basic Reels', description: 'Short, clean edits', items: ['Perfect for ad creatives'] }
        ]
    },
    {
        id: 'content-studio',
        name: 'Content Studio',
        price: 59999,
        saveAmount: 'Save ₹5,000',
        description: 'Brands that rely heavily on video content, storytelling, and monthly content output.',
        idealFor: 'Video-heavy brands',
        color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
        outcome: 'A powerhouse content package giving brands enough videos to dominate social platforms every month.',
        services: [
            { name: 'SMMA Basic', description: 'Monthly content calendar', items: ['Consistent posts', 'Analytics report'] },
            { name: '12 Basic Reels', description: 'High-volume short-form', items: ['Clean edits, captions, audio sync'] },
            { name: '4 Intermediate Reels', description: 'Polished content', items: ['Higher-quality transitions'] },
            { name: '1 Explainer Video', description: '30–60 sec brand explain', items: ['Script + storyboard', 'Intermediate editing', 'VO optional'] }
        ]
    },
    {
        id: 'website-launch',
        name: 'Website Launch',
        price: 69999,
        description: 'New businesses that need a complete website build plus ongoing marketing and content support. (Ongoing ₹38,999/mo)',
        idealFor: 'New businesses needing website',
        color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
        outcome: 'A complete launchpad for new businesses.',
        services: [
            { name: 'Website Standard Build', description: 'Up to 5–7 pages', items: ['Responsive design', 'On-page SEO', 'GA4 + basic events', 'Deployment + hosting support'] },
            { name: 'SMMA Basic', description: 'Social onboarding', items: ['Posting & captions'] },
            { name: '2 Intermediate Reels', description: 'Strong visuals' },
            { name: 'Performance Marketing Basic', description: 'Launch ads' }
        ]
    },
    {
        id: 'ecom-launch',
        name: 'E-Com Launch & Scale',
        price: 149999,
        description: 'Brands launching an e-commerce store and wanting a complete growth ecosystem. (Ongoing ₹79,999/mo + 2% sales)',
        idealFor: 'E-commerce Launch',
        color: 'bg-red-500/10 text-red-700 dark:text-red-300',
        outcome: 'Complete growth ecosystem for e-commerce.',
        services: [
            { name: 'E-commerce Website', description: 'Complete store setup', items: ['Product catalog', 'Payment gateway', 'Shipping rules', 'Conversion tracking'] },
            { name: 'Performance Marketing Pro', description: 'Sales-focused', items: ['Retargeting funnels', 'Testing matrix'] },
            { name: 'SMMA Pro', description: 'High-quality posting', items: ['Content strategy', 'Community management'] },
            { name: '6 Intermediate Reels', description: 'Product-focused', items: ['Multi-format versions'] }
        ]
    }
];
