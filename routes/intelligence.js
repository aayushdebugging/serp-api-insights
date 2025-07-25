const express = require('express');
const router = express.Router();
const { searchCompanyIntelligence } = require('../utils/healthcareIntel');

/**
 * Main Intelligence Endpoint
 * 
 * GET /intelligence?company=HCA&location=Texas
 * GET /intelligence?company=Mayo+Clinic
 * 
 * Returns comprehensive healthcare staffing intelligence for the specified company
 */
router.get('/', async (req, res) => {
    const { company, location } = req.query;

    // Validate required parameters
    if (!company) {
        return res.status(400).json({
            success: false,
            error: 'Company name is required',
            usage: 'GET /intelligence?company=HCA&location=Texas (location optional)'
        });
    }

    try {
        console.log(`🔍 Gathering intelligence for: ${company}${location ? ` in ${location}` : ''}`);

        // Gather comprehensive company intelligence
        const intelligence = await searchCompanyIntelligence(company, location);

        console.log(`✅ Intelligence gathered - Score: ${intelligence.overall_score}/10, Priority: ${intelligence.priority_level}`);

        res.json({
            success: true,
            data: intelligence
        });

    } catch (error) {
        console.error(`❌ Intelligence gathering failed for ${company}:`, error.message);

        res.status(500).json({
            success: false,
            error: 'Failed to gather intelligence',
            details: error.message,
            company: company,
            location: location || null
        });
    }
});

/**
 * Health check endpoint for the intelligence service
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        service: 'Healthcare Staffing Intelligence API',
        status: 'operational',
        timestamp: new Date().toISOString(),
        endpoints: {
            main: 'GET /intelligence?company=<name>&location=<optional>',
            health: 'GET /intelligence/health'
        }
    });
});

module.exports = router; 