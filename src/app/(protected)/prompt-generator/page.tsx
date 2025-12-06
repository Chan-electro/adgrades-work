'use client';

import { useState } from 'react';
import { Download, RefreshCw, ExternalLink, Zap, Search, Target, Brain, Trophy, DollarSign, Edit, Megaphone, TrendingUp, Info, X, Check, Save } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

interface FormData {
    businessName: string;
    companyInfo: string;
    domainOrIndustry: string;
    industry: string;
    niche: string;
    location: string;
    businessModel: string;
}

export default function PromptGeneratorPage() {
    const searchParams = useSearchParams();
    const clientId = searchParams.get('clientId');

    const [formData, setFormData] = useState<FormData>({
        businessName: '',
        companyInfo: '',
        domainOrIndustry: '',
        industry: '',
        niche: '',
        location: '',
        businessModel: ''
    });

    const [showModal, setShowModal] = useState(false);
    const [showPostDownload, setShowPostDownload] = useState(false);
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Fetch client details if clientId is present
    useState(() => {
        if (clientId) {
            fetch(`/api/clients/${clientId}`)
                .then(res => res.json())
                .then(data => {
                    if (data && !data.error) {
                        setFormData(prev => ({
                            ...prev,
                            businessName: data.name || '',
                            location: data.address || '',
                            industry: data.industry || ''
                        }));
                        toast.success(`Loaded details for ${data.name}`);
                    }
                })
                .catch(err => console.error(err));
        }
    });

    const generatePromptTemplate = (data: FormData): string => {
        return `# ═══════════════════════════════════════════════════════════════════════════════
#           COMPREHENSIVE BUSINESS RESEARCH & STRATEGY SUPER-PROMPT
#                     (3-Day All-in-One Research Framework)
# ═══════════════════════════════════════════════════════════════════════════════
#
# Generated for: ${data.businessName}
# Generated on: ${new Date().toLocaleString()}
#
# ═══════════════════════════════════════════════════════════════════════════════


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                              BUSINESS CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Client Information (Provided)

• **Business Name:** ${data.businessName}
• **Company Information:** ${data.companyInfo}
• **Domain/Industry:** ${data.domainOrIndustry}
• **Specific Industry:** ${data.industry}
• **Niche:** ${data.niche}
• **Location:** ${data.location}
• **Business Model:** ${data.businessModel}


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                              ROLE DEFINITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are a seasoned serial entrepreneur and AI strategy advisor with 15+ years 
of experience building and scaling successful companies across multiple industries. 
You combine deep expertise in:

• Market research and competitive analysis
• Customer psychology and behavioral economics
• High-converting copywriting (LIFT Model, PAS, AIDA, BAB frameworks)
• Digital marketing and ad campaign optimization
• Cialdini's 6 Principles of Persuasion
• Go-to-market strategy and revenue modeling

Your task is to help assess and develop the business opportunity described above 
from multiple strategic angles using REAL data, structured insight, and 
customer-focused analysis.

**IMPORTANT INSTRUCTION:** For any data points, customer personas, pricing 
information, ICP details, or other specifics NOT explicitly provided above, 
you must **decide yourself using average industry data and best practices** 
for the ${data.domainOrIndustry} industry in ${data.location}. Make data-backed 
assumptions and clearly state when you are using estimated/average data.

All outputs must be:

✓ Data-backed with recent industry trends and statistics (use real sources)
✓ Actionable with clear next steps
✓ Customer-centric focusing on ICP psychology
✓ Conversion-optimized using proven frameworks

Use markdown formatting for clarity. Complete each section thoroughly.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    DAY 1: MARKET RESEARCH & BUSINESS VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


## 📊 SECTION 1: MARKET GROWTH & INDUSTRY TRENDS ANALYSIS

Analyze the market for **${data.domainOrIndustry}** (specifically **${data.industry}**) 
with comprehensive research:

### 1.1 Market Size & Growth Metrics
• What is the Total Addressable Market (TAM) in current dollars?
• What is the Serviceable Addressable Market (SAM) for ${data.location}?
• What is the realistic Serviceable Obtainable Market (SOM)?
• Is the market growing or shrinking? Provide YoY growth data.
• What is the current CAGR? What is the projected CAGR for the next 5 years?
• What is the market size projection for 2025, 2027, and 2030?

### 1.2 Demographics & Psychographics of the TAM
*Decide yourself with average data for this industry:*
• Age distribution of buyers/decision-makers
• Geographic concentration of demand
• Income/budget levels of target customers
• Education and professional background
• Values, beliefs, and lifestyle characteristics
• Technology adoption patterns
• Decision-making behaviors and buying triggers

### 1.3 Competitive Landscape Analysis
List at least 10 key competitors in **${data.niche}** with the following details for each:
| Competitor | Website | Founded | Funding | Key Offerings | Pricing Model | Market Share | Strengths | Weaknesses |

Categorize competitors into:
• Direct Competitors (same product/service, same market)
• Indirect Competitors (different product, same problem)
• Substitute Solutions (alternative ways customers solve the problem)

### 1.4 Revenue Potential & Financial Projections
*Decide yourself with average industry data:*
• Revenue potential for a new entrant over years 1, 3, and 5
• Average revenue per customer in this industry
• Customer acquisition cost (CAC) benchmarks
• Customer lifetime value (LTV) benchmarks
• LTV:CAC ratio industry standards
• Typical profit margins in this space

### 1.5 Emerging Trends & Opportunities
• List 10 key emerging trends in ${data.industry}
• Identify which trends are underexploited
• How can ${data.businessName} take advantage of these trends?
• What technological shifts are disrupting this space?
• What regulatory changes are impacting the industry?

### 1.6 Sources & Data Validation
Cite at least 10 real, verifiable sources including:
• Industry reports (Gartner, McKinsey, IBISWorld, Statista, etc.)
• News articles from reputable publications
• Academic research or white papers
• Government/regulatory data
• Industry association publications


─────────────────────────────────────────────────────────────────────────────────


## 📋 SECTION 2: BUSINESS IDEA EVALUATION

Analyze ${data.businessName} based on the provided company information:
**${data.companyInfo}**

### 2.1 Problem Validation
List 10 specific problems customers face that ${data.businessName} could solve:
1. [Problem 1 - with severity rating 1-10]
2. [Problem 2 - with severity rating 1-10]
... (continue for all 10)

For each problem, specify:
• How frequently does this problem occur?
• What is the cost/impact of this problem (time, money, stress)?
• How are people currently solving this problem (workarounds)?
• Why are current solutions inadequate?

### 2.2 Ideal Customer Persona (ICP) Deep Dive

**INSTRUCTION:** Create a complete ICP profile. Decide yourself with average 
data based on the ${data.businessModel} model in ${data.industry}.

**Primary ICP Profile:**
• Name/Avatar: [Create a representative name]
• Age Range: [Decide with average data]
• Gender Distribution: [Decide with average data]
• Geographic Location: ${data.location}
• Income Level: [Decide with average data]
• Education Level: [Decide with average data]
• Job Title/Role: [Decide with average data]
• Company Size (if B2B): [Decide with average data]
• Industry/Sector: ${data.industry}

**Demographics:** [Decide all with average data]
• Marital/Family Status
• Technology Proficiency
• Preferred Communication Channels
• Media Consumption Habits
• Social Media Platforms Used

**Psychographics:** [Decide all with average data]
• Core Values
• Lifestyle Characteristics
• Personality Traits
• Aspirations and Goals
• Fears and Anxieties
• Frustrations and Pain Points
• Beliefs about the Problem
• Buying Behavior Patterns
• Brand Preferences
• Information Sources Trusted

**Behavioral Indicators:**
• How do they search for solutions? (Keywords, platforms)
• What triggers them to seek a solution?
• How long is their decision-making process?
• Who else influences their decision?
• What objections do they typically raise?
• What would make them switch from current solution?

### 2.3 TAM/SAM/SOM Analysis for ${data.businessName}
Calculate with methodology and cite at least 5 sources:
• TAM Calculation: [Show math and methodology]
• SAM Calculation: [Show math and methodology]
• SOM Calculation: [Show math and methodology]

### 2.4 Competitive Analysis for ${data.niche}

**Direct Competitors:**
| Company | URL | Key Features | Pricing | Target Market | Strengths | Weaknesses | User Reviews Summary |

**Indirect Competitors:**
| Company | URL | How They Address the Same Need | Gap vs. ${data.businessName}'s Solution |

### 2.5 Unique Selling Proposition (USP) Development
Based on competitive gaps, suggest 3 potential USPs for ${data.businessName}:
1. [USP Option 1] - Why it works, differentiation score (1-10)
2. [USP Option 2] - Why it works, differentiation score (1-10)
3. [USP Option 3] - Why it works, differentiation score (1-10)

Recommended USP: [Select the strongest with justification]

### 2.6 Revenue Model Options
Evaluate potential revenue models for ${data.businessModel}:
| Revenue Model | Description | Pros | Cons | Industry Examples | Recommended (Y/N) |

### 2.7 Pricing Strategy & 5-Year Financial Projections

**INSTRUCTION:** Decide pricing based on average industry rates for ${data.industry}.

**Pricing Recommendation:**
• Suggested Price Point(s): [Decide with average industry data]
• Pricing Psychology Applied
• Comparison to Industry Average
• Justification

**5-Year Financial Projections:**
| Year | Revenue | Customers | CAC | LTV | Profit Margin | Net Profit |
|------|---------|-----------|-----|-----|---------------|------------|
| 1    |         |           |     |     |               |            |
| 2    |         |           |     |     |               |            |
| 3    |         |           |     |     |               |            |
| 4    |         |           |     |     |               |            |
| 5    |         |           |     |     |               |            |

**Key Assumptions:**
• Customer growth rate
• Churn rate
• Average deal size
• Sales cycle length


─────────────────────────────────────────────────────────────────────────────────


## 🎭 SECTION 3: IDEAL CUSTOMER PERSONA PSYCHOLOGY

Based on the ICP you created for ${data.businessName}, embody that persona and provide 
deep psychological insights:

### 3.1 Problems I Face (As the ICP)
Provide at least 10 bullet points with emotional depth

### 3.2 Fears I Have
Provide at least 10 fear-based insights with severity and frequency

### 3.3 Objections Before Purchasing
Provide at least 10 common objections with counter-arguments

### 3.4 Challenges I Face Solving This Problem
Provide at least 10 challenges with impact assessment

### 3.5 Dream Outcomes If Problem Is Solved
Provide at least 10 aspirational outcomes with emotional resonance

### 3.6 Feelings Around Solving the Problem
Emotional journey mapping:
• Before finding a solution: [Emotions]
• During evaluation: [Emotions]
• After purchase: [Expected emotions]
• After achieving results: [Expected emotions]

### 3.7 Importance of Solving This Problem
• Priority ranking (1-10)
• How does this compare to other priorities?
• What would they sacrifice to solve this?
• What is the cost of NOT solving this?


─────────────────────────────────────────────────────────────────────────────────


## 🏷️ SECTION 4: BUSINESS & DOMAIN NAME GENERATION

For ${data.businessName}, generate naming options (if rebranding is considered):

### 4.1 Naming Strategy Considerations
• Business Purpose: Based on ${data.companyInfo}
• Target Customer: [Your created ICP]
• Industry Context: ${data.industry}
• Desired Tone: (Modern / Professional / Playful / Innovative / Trustworthy)
• Country of Operation: ${data.location}

### 4.2 Business Name Suggestions
Generate 10 short, catchy, and memorable alternative business names:

| # | Business Name | Domain (.com) Availability | Meaning/Rationale | Tone | Memorability Score (1-10) |


─────────────────────────────────────────────────────────────────────────────────


## 📝 SECTION 5: BUSINESS FEEDBACK REPORT (TWO PERSPECTIVES)

### 5.1 Perspective 1: As the Ideal Customer

**First Impressions:**
• What do I think about ${data.businessName} at first glance?
• Does this feel like it was made FOR ME?

**Attraction Analysis:**
• What specifically attracts me to this offering?
• What makes me hesitant or skeptical?

**Fear & Objection Mapping:**
• What fears does this trigger?
• What objections would I voice before buying?

**Trust Building Requirements:**
• What would make me trust ${data.businessName}?
• What proof or guarantees would I need?
• What social proof would influence me?

**Competitive Comparison:**
• How does this compare to alternatives I know?
• Why would I choose ${data.businessName} over competitors?
• What would make me switch from my current solution?

**Purchase Decision Factors:**
• What would push me to buy TODAY?
• What would make me delay or abandon purchase?
• What is my expected price point?

### 5.2 Perspective 2: As a Fellow Serial Entrepreneur

**Market Viability Assessment:**
• Market timing: Is this the right moment? (1-10 score with justification)
• Market size adequacy: Is this market big enough? (1-10 score)
• Growth trajectory: Is this market expanding? (1-10 score)

**Competitive Landscape Evaluation:**
• Barrier to entry: How hard is it to compete here? (1-10)
• Competitive intensity: How crowded is this space? (1-10)
• Differentiation opportunity: Can ${data.businessName} stand out? (1-10)

**Business Model Analysis:**
• Pricing Strategy Assessment (decide average industry rates)
• USP Strength Analysis
• Scalability Assessment
• Revenue Model Viability

**Financial Viability (5-Year Horizon):**
• Path to profitability
• Capital requirements
• Break-even timeline
• Investment attractiveness (1-10)

**Risk Assessment:**
• Top 5 business risks with severity ratings and mitigation strategies

**Improvement Recommendations:**
Provide 10 actionable suggestions to improve ${data.businessName}'s business model


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              DAY 2: LANDING PAGE COPYWRITING (LIFT MODEL + ICP PSYCHOLOGY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


## 🎯 COPYWRITING FRAMEWORK FOUNDATION

**The LIFT Conversion Model:**
1. **Value Proposition** - The core reason to convert (must be clear in <5 seconds)
2. **Clarity** - Simple, jargon-free communication
3. **Relevance** - Message matches visitor's needs and expectations
4. **Distraction** - Minimize elements that pull attention from the goal
5. **Urgency** - Create ethical FOMO and time-sensitivity
6. **Anxiety** - Reduce fears and build trust

**Customer Awareness Level:** Decide yourself based on ${data.niche} market maturity
(Unaware / Pain Aware / Solution Aware / Product Aware / Very Aware)

**ICP Psychology to Integrate:** Use the ICP psychology you developed in Section 3


─────────────────────────────────────────────────────────────────────────────────


## 📄 SECTION 6: LANDING PAGE CONTENT GENERATION

Generate complete landing page content for ${data.businessName} in ${data.industry}:

### 6.1 ⭐ HEADLINE
Write 3 big, bold promise headlines that:
• Communicate the #1 benefit in under 10 words
• Trigger an emotional response
• Are specific and measurable where possible

### 6.2 ⭐ SUBHEADLINE
Write a clarifying subheadline (15-25 words maximum)

### 6.3 ⭐ CTA BUTTON TEXT
Provide 3 primary CTA options (strong, confidence-boosting action phrases)

### 6.4 ⭐ WHO NEEDS THIS?
Create 6 detailed customer avatars matching your ICP

### 6.5 ⭐ SOLUTIONS TO CUSTOMER PAIN POINTS
Write 6 benefit-focused bullet points, each tied to LIFT clarity + value

### 6.6 ⭐ SINGLE-LINE BONUS (Urgency)
Write a compelling one-liner about a bonus offer

### 6.7 ⭐ SINGLE-LINE SCARCITY (Ethical FOMO)
Write an ethical scarcity trigger

### 6.8 ⭐ 6+ PAIN POINTS OF THE ICP
Match the persona psychology from your research

### 6.9 ⭐ THE SOLUTION WE OFFER
Write a paragraph explaining how ${data.businessName} solves all above pains

### 6.10 ⭐ TESTIMONIALS
Write 3 realistic testimonials

### 6.11 ⭐ WHAT'S INCLUDED / DELIVERABLES
Clear bullet points of what customers get

### 6.12 ⭐ BONUS SECTION
List 5 powerful bonuses with perceived value

### 6.13 ⭐ FAQ
At least 5 objections with strong reassurance answers

### 6.14 ⭐ FINAL CTA
Write the closing call-to-action with urgency

### 6.15 LIFT COMPLIANCE CHECK
Verify each LIFT element is present with strength rating


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    DAY 3: AD HOOKS, CAMPAIGNS & PERSONA-BASED CREATIVE DEVELOPMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


## 🎣 SECTION 7: HIGH-CONVERTING AD HOOKS

### 7.1 Generate 20 Ad Hooks
Create hooks tailored to ${data.businessName}, ICP, and emotional triggers:

| # | Hook | Type (Fear/Desire/Urgency/Transformation) | Emotional Trigger | Platform Suitability |

### 7.2 Rate Each Hook with Effectiveness Score (1-10)

### 7.3 Top 5 Recommended Hooks with justification


─────────────────────────────────────────────────────────────────────────────────


## 📊 SECTION 8: CAMPAIGN STRUCTURE

### 8.1 Campaign Table
| Campaign Name | Campaign Type | Platform | Target Languages | Bid Strategy | Justification |

### 8.2 Audience Table
Create at least 10 interest-based audiences per campaign

### 8.3 Ads Table
Apply Cialdini's 6 Principles of Persuasion:
• Reciprocity
• Commitment/Consistency
• Consensus/Social Proof
• Authority
• Liking/Sympathy
• Scarcity


─────────────────────────────────────────────────────────────────────────────────


## 🎭 SECTION 9: ICP CREATIVE EVALUATION

Evaluate the generated ads AS the Ideal Customer Persona with detailed assessment


─────────────────────────────────────────────────────────────────────────────────


## 📝 SECTION 10: CUSTOM AD SCRIPT CREATION

Create high-converting ad scripts for ${data.businessName} using:
• PAS (Problem-Agitate-Solution)
• AIDA (Attention-Interest-Desire-Action)
• BAB (Before-After-Bridge)

Include script variations:
• Version A (Fear-Based)
• Version B (Desire-Based)
• Version C (Problem-Solution)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        SWOT ANALYSIS & STRATEGIC RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


## 📈 SECTION 11: COMPREHENSIVE SWOT ANALYSIS

For ${data.businessName}:

### 11.1 Strengths (Internal Positives) - 5 items
### 11.2 Weaknesses (Internal Negatives) - 5 items
### 11.3 Opportunities (External Positives) - 5 items
### 11.4 Threats (External Negatives) - 5 items

### 11.5 SWOT Strategy Matrix
| | Strengths | Weaknesses |
|-------------|-----------|------------|
| **Opportunities** | SO Strategies | WO Strategies |
| **Threats** | ST Strategies | WT Strategies |


─────────────────────────────────────────────────────────────────────────────────


## 🎯 SECTION 12: STRATEGIC RECOMMENDATIONS

### 12.1 Immediate Actions (0-30 Days) - 5 items
### 12.2 Short-Term Goals (1-3 Months) - 5 items
### 12.3 Medium-Term Goals (3-12 Months) - 5 items
### 12.4 Long-Term Vision (1-3 Years) - 3 items


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                              FUNNEL & PRICING STRATEGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


## 💰 SECTION 13: PRICING STRATEGY

**INSTRUCTION:** Decide all pricing with average industry data for ${data.industry}

### 13.1 Pricing Model Recommendation
### 13.2 Price Point Analysis with industry comparison
### 13.3 Pricing Psychology to Apply
### 13.4 Tiered Pricing Structure (If Applicable)


─────────────────────────────────────────────────────────────────────────────────


## 🔄 SECTION 14: FUNNEL STRATEGY

### 14.1 Customer Journey Map (5 stages: Awareness → Retention)
### 14.2 Lead Magnet Recommendations (3 options)
### 14.3 Email Sequence Framework (5 emails)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                              OUTPUT RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ✅ QUALITY STANDARDS

1. ✓ Must be data-backed with real industry statistics where possible
2. ✓ For any missing data, decide yourself using average industry benchmarks
3. ✓ Clearly indicate when using estimated/average data
4. ✓ Must deeply integrate ICP psychology throughout
5. ✓ Must demonstrate all LIFT elements explicitly in copywriting
6. ✓ Must apply Cialdini's principles in advertising
7. ✓ Must be crisp, persuasive, and conversion-driven
8. ✓ No URLs required in final output (but cite sources by name)
9. ✓ No placeholder text in final generated content
10. ✓ No generic fluff — everything must feel tailored to ${data.businessName}
11. ✓ Use markdown formatting for clarity
12. ✓ Provide actionable recommendations, not just observations


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                              END OF PROMPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.businessName || !formData.companyInfo || !formData.domainOrIndustry ||
            !formData.industry || !formData.niche || !formData.location || !formData.businessModel) {
            alert('Please fill in all required fields');
            return;
        }

        const prompt = generatePromptTemplate(formData);
        setGeneratedPrompt(prompt);
        setShowModal(true);
    };

    const handleDownload = () => {
        const blob = new Blob([generatedPrompt], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        const businessName = formData.businessName.replace(/[^a-zA-Z0-9]/g, '_') || 'Research';
        const date = new Date().toISOString().split('T')[0];
        const filename = `${businessName}_Research_Prompt_${date}.txt`;

        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setShowModal(false);
        setShowPostDownload(true);
    };

    const handleSaveToProfile = async () => {
        if (!clientId) return;

        setIsSaving(true);
        try {
            const res = await fetch('/api/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId,
                    title: `Research for ${formData.businessName}`,
                    content: generatedPrompt
                })
            });

            if (res.ok) {
                toast.success('Research saved to client profile');
            } else {
                toast.error('Failed to save research');
            }
        } catch (error) {
            toast.error('Error saving research');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setFormData({
            businessName: '',
            companyInfo: '',
            domainOrIndustry: '',
            industry: '',
            niche: '',
            location: '',
            businessModel: ''
        });
        setGeneratedPrompt('');
        setShowPostDownload(false);
    };

    const handleGenerateNew = () => {
        setShowPostDownload(false);
        handleReset();
    };

    const features = [
        { icon: <TrendingUp size={18} />, label: 'Market Analysis & TAM/SAM/SOM' },
        { icon: <Target size={18} />, label: 'Ideal Customer Persona (ICP)' },
        { icon: <Brain size={18} />, label: 'Customer Psychology Deep-Dive' },
        { icon: <Trophy size={18} />, label: 'Competitive Analysis' },
        { icon: <DollarSign size={18} />, label: 'Pricing Strategy' },
        { icon: <Edit size={18} />, label: 'Landing Page Copy' },
        { icon: <Megaphone size={18} />, label: 'Ad Hooks & Campaigns' },
        { icon: <TrendingUp size={18} />, label: 'SWOT & Strategy Recommendations' },
    ];

    if (showPostDownload) {
        return (
            <div className="space-y-6 max-w-7xl mx-auto p-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-8 text-center border border-green-200">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                        <Check size={48} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Your Research Prompt is Ready!</h2>
                    <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                        Now paste this prompt into Perplexity AI for comprehensive, data-backed business research and strategy analysis.
                    </p>

                    <div className="flex justify-center gap-3 mb-8 flex-wrap">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
                            <span className="w-7 h-7 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                            <span className="text-sm text-gray-600">Open the downloaded .txt file</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
                            <span className="w-7 h-7 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                            <span className="text-sm text-gray-600">Copy all the content</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
                            <span className="w-7 h-7 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                            <span className="text-sm text-gray-600">Paste it into Perplexity AI</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-3 flex-wrap">
                        <a
                            href="https://www.perplexity.ai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg"
                        >
                            <ExternalLink size={20} />
                            Open Perplexity AI
                        </a>
                        <button
                            onClick={handleGenerateNew}
                            className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition border border-gray-300"
                        >
                            <Zap size={20} />
                            Generate New Prompt
                        </button>
                        {clientId && (
                            <button
                                onClick={handleSaveToProfile}
                                disabled={isSaving}
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
                            >
                                <Save size={20} />
                                {isSaving ? 'Saving...' : 'Save to Client Profile'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="bg-white dark:bg-card rounded-xl shadow-lg p-4 sm:p-8 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6 mb-6">
                    <div className="flex-shrink-0">
                        <img src="/adgrades-logo.png" alt="AdGrades Logo" className="h-12 sm:h-20 object-contain" />
                    </div>
                    <div className="sm:text-right">
                        <h1 className="text-xl sm:text-3xl font-bold text-foreground">Research Prompt Generator</h1>
                        <p className="text-slate-600 mt-1 text-sm sm:text-base">AdGrades Marketing Agency</p>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Info size={24} className="text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground mb-1">Simple & Quick</h3>
                    <p className="text-gray-600 text-sm">
                        Just fill in your basic business details below. The AI will automatically analyze and generate comprehensive research for ICP, pricing, marketing, and more!
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Business Information Section */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6">
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                        <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Search size={28} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Your Business Details</h2>
                            <p className="text-sm text-gray-500">Tell us about your business - we'll handle the rest!</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                <span>🏢</span> Business Name
                            </label>
                            <input
                                type="text"
                                value={formData.businessName}
                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                placeholder="e.g., Acme Solutions, TechStart Inc."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                required
                            />
                            <span className="text-xs text-gray-400 mt-1">Your company or brand name</span>
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                <span>📍</span> Location
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g., New York, USA / India / Global"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                required
                            />
                            <span className="text-xs text-gray-400 mt-1">Where you operate or target</span>
                        </div>
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                <span>📝</span> Company Information
                            </label>
                            <textarea
                                value={formData.companyInfo}
                                onChange={(e) => setFormData({ ...formData, companyInfo: e.target.value })}
                                placeholder="Brief description of your company, what you do, your mission, and core offerings..."
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                                required
                            />
                            <span className="text-xs text-gray-400 mt-1">Help us understand your business story</span>
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                <span>🌐</span> Domain / Industry
                            </label>
                            <input
                                type="text"
                                value={formData.domainOrIndustry}
                                onChange={(e) => setFormData({ ...formData, domainOrIndustry: e.target.value })}
                                placeholder="e.g., SaaS, E-commerce, Healthcare, Education"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                required
                            />
                            <span className="text-xs text-gray-400 mt-1">Broad business category</span>
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                <span>🎯</span> Specific Industry
                            </label>
                            <input
                                type="text"
                                value={formData.industry}
                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                placeholder="e.g., Digital Marketing, Fintech, EdTech"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                required
                            />
                            <span className="text-xs text-gray-400 mt-1">Your specific vertical</span>
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                <span>💎</span> Niche
                            </label>
                            <input
                                type="text"
                                value={formData.niche}
                                onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                                placeholder="e.g., AI-powered lead generation for B2B startups"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                required
                            />
                            <span className="text-xs text-gray-400 mt-1">Your specialized focus area</span>
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                <span>💰</span> Business Model
                            </label>
                            <input
                                type="text"
                                value={formData.businessModel}
                                onChange={(e) => setFormData({ ...formData, businessModel: e.target.value })}
                                placeholder="e.g., B2B SaaS, B2C E-commerce, Agency Services"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                required
                            />
                            <span className="text-xs text-gray-400 mt-1">How you generate revenue</span>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 text-center flex items-center justify-center gap-2">
                        <span>🚀</span> What the AI Will Generate For You
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition"
                            >
                                <span className="text-purple-600">{feature.icon}</span>
                                <span className="text-sm text-gray-600">{feature.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 flex-wrap">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition border border-gray-300"
                    >
                        <RefreshCw size={20} />
                        Reset
                    </button>
                    <button
                        type="submit"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg"
                    >
                        <Zap size={20} />
                        Generate Research Prompt
                    </button>
                </div>
            </form>

            {/* Success Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                            <Check size={40} className="text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">Prompt Generated Successfully!</h3>
                        <p className="text-gray-600 mb-6">Your comprehensive research prompt is ready for download.</p>
                        <div className="space-y-3">
                            <button
                                onClick={handleDownload}
                                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition"
                            >
                                <Download size={20} />
                                Download .txt File
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition border border-gray-300"
                            >
                                <X size={20} />
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
