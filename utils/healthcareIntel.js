const { fetchSerpApiData } = require('./serpApi');

// Healthcare modality keywords for detection
const MODALITY_KEYWORDS = {
    'radiology': ['radiology', 'x-ray', 'imaging', 'radiologic', 'diagnostic imaging'],
    'mri': ['MRI', 'magnetic resonance', 'mr tech', 'mr technologist'],
    'ct': ['CT', 'computed tomography', 'cat scan', 'ct tech'],
    'echo': ['echo', 'echocardiography', 'cardiac ultrasound', 'echo tech'],
    'cath_lab': ['cath lab', 'catheterization', 'interventional cardiology', 'cardiac cath'],
    'interventional': ['interventional', 'IR', 'vascular', 'interventional radiology']
};

// Urgency indicators
const URGENCY_KEYWORDS = ['immediate', 'ASAP', 'urgent', 'stat', 'emergency coverage', 'rush', 'critical need'];

// Contract type indicators
const CONTRACT_KEYWORDS = ['travel', 'contract', 'locum', 'temporary', 'per diem', 'interim'];

// Executive change indicators
const EXECUTIVE_KEYWORDS = ['new COO', 'new CMO', 'new CEO', 'appointed', 'joins as', 'leadership change', 'promoted to'];

// Expansion indicators
const EXPANSION_KEYWORDS = ['expanding', 'new department', 'service line', 'lab space', 'facility expansion', 'opening new'];

// Known staffing platforms
const STAFFING_PLATFORMS = [
    'aya.healthcare',
    'amnhealthcare.com',
    'vivian.com',
    'totalmed.com',
    'crosscountrynurses.com',
    'medicaltravelers.com'
];

/**
 * Main function to gather comprehensive company intelligence
 */
async function searchCompanyIntelligence(company, location = '') {
    try {
        // Run parallel searches for comprehensive data
        const [hiringData, signalsData, newsData] = await Promise.all([
            searchHiringActivity(company, location),
            searchSupplementarySignals(company, location),
            searchRecentNews(company, location)
        ]);

        // Aggregate and score the intelligence
        const intelligence = aggregateIntelligence(hiringData, signalsData, newsData, company, location);

        return intelligence;
    } catch (error) {
        throw new Error(`Intelligence gathering failed: ${error.message}`);
    }
}

/**
 * Search for recent hiring activity
 */
async function searchHiringActivity(company, location = '') {
    // Build healthcare-specific job search queries
    const modalityQuery = Object.keys(MODALITY_KEYWORDS).map(m => `"${m}"`).join(' OR ');
    const contractQuery = CONTRACT_KEYWORDS.map(c => `"${c}"`).join(' OR ');

    let query = `"${company}" AND (${contractQuery}) AND (${modalityQuery})`;

    if (location) {
        query += ` AND "${location}"`;
    }

    try {
        const data = await fetchSerpApiData({
            engine: "google_jobs",
            q: query,
            tbs: 'qdr:w2' // last 2 weeks
        });

        const jobs = (data.jobs_results || []).map(job => ({
            title: job.title || "N/A",
            company: job.company_name || company,
            location: job.location || "N/A",
            posted_at: job.detected_extensions?.posted_at || "N/A",
            description: job.description?.trim() || "",
            share_link: job.share_link || "",
            modality: detectModality(job.title + " " + job.description),
            urgency: calculateJobUrgency(job.title + " " + job.description),
            contract_type: detectContractType(job.title + " " + job.description),
            platform: detectPlatform(job.share_link || ""),
            apply_links: (job.apply_options || []).map(opt => ({
                title: opt.title,
                link: opt.link
            }))
        }));

        return {
            total_postings: jobs.length,
            urgent_count: jobs.filter(j => j.urgency === 'high').length,
            modalities: [...new Set(jobs.map(j => j.modality).filter(Boolean))],
            contract_types: [...new Set(jobs.map(j => j.contract_type).filter(Boolean))],
            postings: jobs
        };
    } catch (error) {
        return { total_postings: 0, urgent_count: 0, modalities: [], contract_types: [], postings: [] };
    }
}

/**
 * Search for supplementary signals
 */
async function searchSupplementarySignals(company, location = '') {
    const signalQueries = [
        `"${company}" AND (${EXECUTIVE_KEYWORDS.map(k => `"${k}"`).join(' OR ')})`,
        `"${company}" AND (${EXPANSION_KEYWORDS.map(k => `"${k}"`).join(' OR ')})`,
        `"${company}" AND ("FDA approval" OR "trial site" OR "new program" OR "research initiative")`
    ];

    let query = signalQueries.join(' OR ');
    if (location) {
        query += ` AND "${location}"`;
    }

    try {
        const data = await fetchSerpApiData({
            engine: "google_news",
            q: query,
            tbs: 'qdr:w2'
        });

        const signals = (data.news_results || []).map(item => ({
            headline: item.title?.trim() || "",
            source: typeof item.source === 'object' ? item.source.name : item.source,
            date: item.date || 'N/A',
            snippet: item.snippet || item.description || '',
            link: item.link,
            signal_type: detectSignalType(item.title + " " + (item.snippet || "")),
            relevance_score: calculateRelevanceScore(item.title + " " + (item.snippet || ""), company)
        }));

        return {
            executive_changes: signals.filter(s => s.signal_type === 'executive'),
            expansion_activity: signals.filter(s => s.signal_type === 'expansion'),
            fda_activity: signals.filter(s => s.signal_type === 'fda'),
            other_signals: signals.filter(s => s.signal_type === 'other')
        };
    } catch (error) {
        return { executive_changes: [], expansion_activity: [], fda_activity: [], other_signals: [] };
    }
}

/**
 * Search for recent company news
 */
async function searchRecentNews(company, location = '') {
    let query = `"${company}" AND ("hiring" OR "expansion" OR "acquisition" OR "partnership" OR "contract")`;

    if (location) {
        query += ` AND "${location}"`;
    }

    try {
        const data = await fetchSerpApiData({
            engine: "google_news",
            q: query,
            tbs: 'qdr:w1'
        });

        return (data.news_results || []).map(item => ({
            headline: item.title?.trim() || "",
            source: typeof item.source === 'object' ? item.source.name : item.source,
            date: item.date || 'N/A',
            snippet: item.snippet || item.description || '',
            link: item.link,
            relevance_score: calculateRelevanceScore(item.title + " " + (item.snippet || ""), company)
        }));
    } catch (error) {
        return [];
    }
}

/**
 * Detect healthcare modality from text
 */
function detectModality(text) {
    const lowerText = text.toLowerCase();
    for (const [modality, keywords] of Object.entries(MODALITY_KEYWORDS)) {
        if (keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
            return modality;
        }
    }
    return null;
}

/**
 * Calculate job urgency level
 */
function calculateJobUrgency(text) {
    const lowerText = text.toLowerCase();
    const urgentMatches = URGENCY_KEYWORDS.filter(keyword =>
        lowerText.includes(keyword.toLowerCase())
    );

    if (urgentMatches.length >= 2) return 'high';
    if (urgentMatches.length === 1) return 'medium';
    return 'low';
}

/**
 * Detect contract type
 */
function detectContractType(text) {
    const lowerText = text.toLowerCase();
    for (const keyword of CONTRACT_KEYWORDS) {
        if (lowerText.includes(keyword.toLowerCase())) {
            return keyword;
        }
    }
    return null;
}

/**
 * Detect posting platform
 */
function detectPlatform(url) {
    for (const platform of STAFFING_PLATFORMS) {
        if (url.includes(platform)) {
            return platform;
        }
    }
    return 'other';
}

/**
 * Detect signal type from news content
 */
function detectSignalType(text) {
    const lowerText = text.toLowerCase();

    if (EXECUTIVE_KEYWORDS.some(k => lowerText.includes(k.toLowerCase()))) {
        return 'executive';
    }
    if (EXPANSION_KEYWORDS.some(k => lowerText.includes(k.toLowerCase()))) {
        return 'expansion';
    }
    if (lowerText.includes('fda') || lowerText.includes('trial') || lowerText.includes('approval')) {
        return 'fda';
    }
    return 'other';
}

/**
 * Calculate relevance score for news items
 */
function calculateRelevanceScore(text, company) {
    const lowerText = text.toLowerCase();
    const lowerCompany = company.toLowerCase();

    let score = 0;

    // Company mention frequency
    const companyMentions = (lowerText.match(new RegExp(lowerCompany, 'g')) || []).length;
    score += companyMentions * 2;

    // Healthcare relevance
    const healthcareKeywords = ['healthcare', 'hospital', 'medical', 'clinical', 'patient'];
    score += healthcareKeywords.filter(k => lowerText.includes(k)).length;

    // Hiring relevance  
    const hiringKeywords = ['hiring', 'staffing', 'recruitment', 'positions', 'jobs'];
    score += hiringKeywords.filter(k => lowerText.includes(k)).length * 2;

    return Math.min(score, 10);
}

/**
 * Aggregate all intelligence data and create actionable insights
 */
function aggregateIntelligence(hiringData, signalsData, newsData, company, location) {
    // Calculate overall confidence and priority scores
    const overallScore = calculateOverallScore(hiringData, signalsData, newsData);
    const priorityLevel = overallScore >= 7 ? 'HIGH' : overallScore >= 4 ? 'MEDIUM' : 'LOW';

    // Determine actionable timeline
    const hasUrgentHiring = hiringData.urgent_count > 0;
    const hasRecentSignals = (signalsData.executive_changes.length + signalsData.expansion_activity.length) > 0;
    const actionableTimeline = hasUrgentHiring || hasRecentSignals ? 'within_week' : 'within_month';

    // Generate recommendations
    const recommendations = generateRecommendations(hiringData, signalsData, overallScore);

    return {
        company,
        location: location || null,
        search_timestamp: new Date().toISOString(),
        overall_score: overallScore,
        priority_level: priorityLevel,
        actionable_timeline: actionableTimeline,

        hiring_activity: {
            recent_postings_count: hiringData.total_postings,
            urgent_needs: hiringData.urgent_count,
            modalities_hiring: hiringData.modalities,
            contract_types: hiringData.contract_types,
            postings: hiringData.postings.slice(0, 10) // Limit to top 10
        },

        supplementary_signals: signalsData,

        recent_news: newsData.slice(0, 5), // Top 5 most relevant

        confidence_indicators: {
            multiple_signals: (hiringData.total_postings + signalsData.executive_changes.length + signalsData.expansion_activity.length) > 2,
            verified_sources: true, // All from SerpApi
            recent_activity: hasUrgentHiring || hasRecentSignals,
            contact_info_available: hiringData.postings.some(p => p.apply_links.length > 0)
        },

        recommendations
    };
}

/**
 * Calculate overall actionability score
 */
function calculateOverallScore(hiringData, signalsData, newsData) {
    let score = 0;

    // Hiring activity scoring
    score += Math.min(hiringData.total_postings * 0.5, 3); // Max 3 points
    score += hiringData.urgent_count * 1; // 1 point per urgent posting
    score += hiringData.modalities.length * 0.5; // Multiple modalities

    // Signal scoring
    score += signalsData.executive_changes.length * 1.5; // Executive changes valuable
    score += signalsData.expansion_activity.length * 1; // Expansion signals
    score += signalsData.fda_activity.length * 0.5; // FDA activity

    // News relevance
    const highRelevanceNews = newsData.filter(n => n.relevance_score >= 6).length;
    score += highRelevanceNews * 0.5;

    return Math.min(Math.round(score), 10);
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(hiringData, signalsData, overallScore) {
    const recommendations = {
        priority: overallScore >= 7 ? 'HIGH' : overallScore >= 4 ? 'MEDIUM' : 'LOW',
        reasoning: [],
        next_actions: [],
        talking_points: []
    };

    // Build reasoning
    if (hiringData.urgent_count > 0) {
        recommendations.reasoning.push(`${hiringData.urgent_count} urgent hiring needs detected`);
    }
    if (signalsData.executive_changes.length > 0) {
        recommendations.reasoning.push('Recent executive changes indicate organizational shifts');
    }
    if (signalsData.expansion_activity.length > 0) {
        recommendations.reasoning.push('Expansion activity suggests growing staffing needs');
    }

    // Generate next actions
    if (overallScore >= 7) {
        recommendations.next_actions.push('Contact directly within 24-48 hours');
        recommendations.next_actions.push('Reference specific urgent openings in outreach');
    } else if (overallScore >= 4) {
        recommendations.next_actions.push('Add to priority follow-up list');
        recommendations.next_actions.push('Monitor for additional signals');
    } else {
        recommendations.next_actions.push('Add to general monitoring list');
    }

    // Generate talking points
    if (hiringData.modalities.length > 0) {
        recommendations.talking_points.push(`Immediate availability for ${hiringData.modalities.join(', ')} positions`);
    }
    if (signalsData.expansion_activity.length > 0) {
        recommendations.talking_points.push('Experience supporting rapid deployment for expanding facilities');
    }

    recommendations.reasoning = recommendations.reasoning.join(' + ');

    return recommendations;
}

module.exports = {
    searchCompanyIntelligence,
    detectModality,
    calculateJobUrgency,
    detectContractType
}; 