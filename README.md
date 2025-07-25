# Healthcare Staffing Intelligence API

A comprehensive intelligence gathering system for healthcare staffing opportunities, specifically designed for clinical recruitment in modalities like Radiology, MRI, CT, Echo, Cath Lab, and Interventional procedures.

## 🎯 Purpose

This API provides **actionable intelligence** for healthcare staffing companies by monitoring:
- **Recent hiring activity** (last 7-14 days) for clinical roles
- **Executive changes** and organizational shifts  
- **Facility expansions** and new service lines
- **Market signals** indicating staffing needs

## 🚀 Quick Start

### Prerequisites
1. Get a SerpApi key from [https://serpapi.com/](https://serpapi.com/)
2. Create a `.env` file with:
   ```
   SERP_API_KEY=your_serpapi_key_here
   PORT=3000
   ```

### Installation & Running
```bash
npm install
npm start
```

Server will run at `http://localhost:3000`

## 📊 Main Endpoint

### Intelligence Gathering
```
GET /intelligence?company=<name>&location=<optional>
```

**Simple Input Examples:**
```bash
# Just company name (most common)
GET /intelligence?company=HCA Healthcare

# With location for regional focus
GET /intelligence?company=Mayo Clinic&location=Arizona

# Multi-word companies (URL encoded)
GET /intelligence?company=Kaiser+Permanente&location=California
```

## 📋 Response Structure

```json
{
  "success": true,
  "data": {
    "company": "HCA Healthcare",
    "location": "Texas",
    "search_timestamp": "2024-01-15T10:30:00Z",
    "overall_score": 9,
    "priority_level": "HIGH",
    "actionable_timeline": "within_week",
    
    "hiring_activity": {
      "recent_postings_count": 15,
      "urgent_needs": 3,
      "modalities_hiring": ["MRI", "CT", "Radiology"],
      "contract_types": ["travel", "locum"],
      "postings": [...]
    },
    
    "supplementary_signals": {
      "executive_changes": [...],
      "expansion_activity": [...],
      "fda_activity": [...]
    },
    
    "recent_news": [...],
    
    "confidence_indicators": {
      "multiple_signals": true,
      "verified_sources": true,
      "recent_activity": true,
      "contact_info_available": true
    },
    
    "recommendations": {
      "priority": "HIGH",
      "reasoning": "3 urgent hiring needs + expansion activity",
      "next_actions": [
        "Contact directly within 24-48 hours",
        "Reference specific urgent openings in outreach"
      ],
      "talking_points": [
        "Immediate availability for MRI, CT, Radiology positions",
        "Experience supporting rapid deployment for expanding facilities"
      ]
    }
  }
}
```

## 🎯 Key Features

### Automated Detection
- **Healthcare Modalities**: Radiology, MRI, CT, Echo, Cath Lab, Interventional
- **Contract Types**: Travel, Locum, Contract, Per Diem
- **Urgency Levels**: Immediate, ASAP, Urgent, Stat needs
- **Staffing Platforms**: Aya, AMN, Vivian, TotalMed, etc.

### Intelligence Scoring
- **Overall Score**: 1-10 actionability rating
- **Priority Levels**: HIGH/MEDIUM/LOW
- **Timeline**: within_week vs within_month
- **Confidence Indicators**: Multiple signal validation

### Signal Detection
- **Executive Changes**: New COO, CMO, leadership shifts
- **Expansion Activity**: New departments, service lines
- **FDA Activity**: Trial sites, program launches
- **Urgent Hiring**: Immediate needs, emergency coverage

## 🏥 Use Cases

### Primary Use Cases
1. **Target Account Research**: Quick intelligence on healthcare systems
2. **Opportunity Identification**: Find urgent clinical staffing needs  
3. **Market Intelligence**: Track expansion and growth signals
4. **Competitive Analysis**: Monitor industry hiring patterns

### Example Workflows
```bash
# Morning intelligence gathering
GET /intelligence?company=HCA Healthcare
GET /intelligence?company=Tenet Healthcare  
GET /intelligence?company=CommonSpirit Health

# Regional focus
GET /intelligence?company=Banner Health&location=Arizona
GET /intelligence?company=Houston Methodist&location=Texas
```

## 🔧 Legacy Endpoints

The original SERP monitoring endpoints remain available:

- `GET /jobs` - Job postings search
- `GET /news` - News monitoring with signals
- `GET /search` - General search results

## 🏗️ Technical Architecture

### Core Components
- **`routes/intelligence.js`**: Main API endpoint
- **`utils/healthcareIntel.js`**: Intelligence processing engine
- **`utils/serpApi.js`**: SerpApi integration layer

### Search Strategy
1. **Parallel Intelligence Gathering**: Jobs + News + Signals simultaneously
2. **Healthcare-Specific Queries**: Modality and contract type focused
3. **Temporal Filtering**: Recent activity (7-14 days) prioritized
4. **Platform Targeting**: Known staffing platforms emphasized

### Scoring Algorithm
- **Hiring Activity**: Recent postings + urgency indicators
- **Signal Amplification**: Executive changes + expansion news
- **Confidence Scoring**: Multiple source validation
- **Actionability Timeline**: Immediate vs monitoring opportunities

## 📈 Response Interpretation

### Priority Levels
- **HIGH (7-10)**: Immediate action recommended, multiple strong signals
- **MEDIUM (4-6)**: Monitor closely, some positive indicators  
- **LOW (1-3)**: General monitoring, weak/no signals

### Actionable Timelines
- **within_week**: Urgent hiring or strong expansion signals
- **within_month**: General opportunity, slower timeline

### Confidence Indicators
- **multiple_signals**: ≥3 different signal types detected
- **verified_sources**: All data from verified search results
- **recent_activity**: Activity within last 7 days
- **contact_info_available**: Direct application links found

## 🎯 Best Practices

### Input Optimization
- Use **full company names** for best results
- Include **location** for regional healthcare systems  
- Try **variations** of company names if needed

### Response Usage
- Focus on **HIGH priority** results for immediate action
- Use **talking_points** for sales conversations
- Reference **specific modalities** and **urgent needs** in outreach
- Monitor **expansion_activity** for timing conversations

### API Usage
- Check **overall_score** first for quick prioritization
- Review **recent_postings_count** for volume assessment  
- Use **actionable_timeline** for follow-up scheduling
- Leverage **recommendations** for next steps

---

*Built for healthcare staffing intelligence • Powered by SerpApi • Focused on actionable insights* 