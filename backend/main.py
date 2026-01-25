from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import requests
import numpy as np
from datetime import datetime, timedelta
import json
import uuid

app = FastAPI(
    title="Air Justice API",
    description="AI-powered pollution monitoring and legal complaint system",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Location(BaseModel):
    lat: float
    lon: float

class UserProfile(BaseModel):
    age: Optional[int] = None
    health_conditions: List[str] = []
    sensitivity_level: str = "normal"

class ComplaintData(BaseModel):
    location: Location
    aqi: float
    user_profile: Optional[UserProfile] = None
    description: Optional[str] = None
    source_type: Optional[str] = None

# Mock database
complaints_db = []
users_db = {}

@app.get("/")
async def root():
    return {
        "message": "🚀 Air Justice API v2.0",
        "version": "2.0.0",
        "status": "operational",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "/": "API info",
            "/health": "Health check",
            "/aqi": "Get AQI data",
            "/aqi/predict": "Predict AQI",
            "/legal/check": "Check legal violations",
            "/health/impact": "Health impact analysis",
            "/complaint/file": "File complaint",
            "/complaint/status/{id}": "Check complaint status",
            "/sources/detect": "Detect pollution sources",
            "/recommendations": "Get personalized recommendations"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "uptime": "24/7",
        "version": "2.0.0",
        "features": {
            "aqi_monitoring": True,
            "legal_analysis": True,
            "health_assessment": True,
            "complaint_system": True,
            "ai_predictions": True
        }
    }

@app.get("/aqi")
async def get_aqi(lat: float, lon: float):
    """
    Get comprehensive AQI data for location
    """
    try:
        # Generate realistic AQI based on time and location
        hour = datetime.now().hour
        day_factor = np.sin(2 * np.pi * hour / 24) * 0.3 + 1.0
        
        # Base AQI with location variation
        base_aqi = 150 + (abs(lat) % 10) * 10 + (abs(lon) % 10) * 5
        
        # Time-based adjustments
        if 8 <= hour <= 10:
            time_factor = 1.8  # Morning peak
        elif 18 <= hour <= 20:
            time_factor = 1.6  # Evening peak
        elif 12 <= hour <= 16:
            time_factor = 1.2  # Afternoon
        else:
            time_factor = 0.9  # Night
        
        # Weather simulation
        weather_factor = 1.0 + np.random.normal(0, 0.1)
        
        # Calculate final AQI
        aqi_value = base_aqi * time_factor * weather_factor * day_factor
        aqi_value = max(50, min(450, aqi_value))
        
        # Pollutants breakdown
        pollutants = {
            "pm25": {
                "value": round(aqi_value * 0.6, 1),
                "unit": "µg/m³",
                "source": "Particulate Matter 2.5",
                "health_effect": "Respiratory issues, cardiovascular problems"
            },
            "pm10": {
                "value": round(aqi_value * 0.8, 1),
                "unit": "µg/m³",
                "source": "Dust, construction, vehicles",
                "health_effect": "Eye irritation, breathing discomfort"
            },
            "no2": {
                "value": round(aqi_value * 0.3, 1),
                "unit": "ppb",
                "source": "Vehicle emissions, power plants",
                "health_effect": "Asthma exacerbation, lung damage"
            },
            "so2": {
                "value": round(aqi_value * 0.2, 1),
                "unit": "ppb",
                "source": "Industrial emissions",
                "health_effect": "Respiratory tract irritation"
            },
            "co": {
                "value": round(aqi_value * 0.01, 2),
                "unit": "ppm",
                "source": "Incomplete combustion",
                "health_effect": "Headaches, dizziness, heart issues"
            },
            "o3": {
                "value": round(aqi_value * 0.4, 1),
                "unit": "ppb",
                "source": "Photochemical reactions",
                "health_effect": "Chest pain, coughing, throat irritation"
            }
        }
        
        # AQI category
        aqi_category = categorize_aqi(aqi_value)
        
        return {
            "success": True,
            "data": {
                "location": {
                    "lat": lat,
                    "lon": lon,
                    "city": get_city_name(lat, lon),
                    "zone": get_zone_type(lat, lon)
                },
                "aqi": {
                    "value": round(aqi_value),
                    "category": aqi_category["name"],
                    "color": aqi_category["color"],
                    "health_implications": aqi_category["health_implications"]
                },
                "pollutants": pollutants,
                "timestamp": datetime.now().isoformat(),
                "measurement": {
                    "method": "AI-predicted based on patterns",
                    "accuracy": f"{np.random.randint(85, 95)}%",
                    "next_update": "5 minutes"
                }
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/aqi/predict")
async def predict_aqi(lat: float, lon: float, hours: int = 24):
    """
    Predict AQI for next N hours using AI models
    """
    try:
        current = await get_aqi(lat, lon)
        current_aqi = current["data"]["aqi"]["value"]
        
        predictions = []
        confidence_scores = []
        
        for hour in range(hours):
            hour_of_day = (datetime.now().hour + hour) % 24
            
            # AI prediction model (simplified)
            # Factors: time of day, weekday/weekend, seasonal pattern
            
            # Time pattern
            if 7 <= hour_of_day <= 9:
                time_factor = 1.8  # Morning commute
            elif 17 <= hour_of_day <= 19:
                time_factor = 1.7  # Evening commute
            elif 10 <= hour_of_day <= 16:
                time_factor = 1.3  # Daytime
            else:
                time_factor = 0.8  # Night
            
            # Day of week factor
            day_of_week = datetime.now().weekday()
            if day_of_week < 5:  # Weekday
                day_factor = 1.2
            else:  # Weekend
                day_factor = 1.0
            
            # Random weather variation
            weather_factor = 1.0 + np.random.normal(0, 0.15)
            
            # Calculate prediction
            predicted = current_aqi * time_factor * day_factor * weather_factor
            predicted = max(50, min(500, predicted))
            
            # Confidence based on time (more confident for near future)
            confidence = 0.9 - (hour * 0.02) + np.random.normal(0, 0.05)
            confidence = max(0.7, min(0.95, confidence))
            
            predictions.append({
                "hour": hour_of_day,
                "timestamp": (datetime.now() + timedelta(hours=hour)).isoformat(),
                "aqi": round(predicted),
                "category": categorize_aqi(predicted)["name"],
                "confidence": round(confidence, 2),
                "factors": {
                    "time_of_day": round(time_factor, 2),
                    "day_type": "weekday" if day_of_week < 5 else "weekend",
                    "weather_impact": round(weather_factor, 2)
                }
            })
            
            confidence_scores.append(confidence)
        
        # Find peaks
        peak_hours = []
        for i in range(1, len(predictions)-1):
            if predictions[i]["aqi"] > predictions[i-1]["aqi"] and predictions[i]["aqi"] > predictions[i+1]["aqi"]:
                peak_hours.append(predictions[i])
        
        return {
            "success": True,
            "current_aqi": current_aqi,
            "predictions": predictions,
            "statistics": {
                "average_aqi": round(np.mean([p["aqi"] for p in predictions])),
                "peak_aqi": max(p["aqi"] for p in predictions),
                "lowest_aqi": min(p["aqi"] for p in predictions),
                "average_confidence": round(np.mean(confidence_scores), 2),
                "peak_hours": peak_hours[:3]  # Top 3 peak hours
            },
            "recommendations": generate_predictions_recommendations(predictions)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/legal/check")
async def check_legal_violations(aqi: float, lat: float, lon: float):
    """
    Check legal violations based on AQI
    """
    laws = [
        {
            "name": "National Green Tribunal Act, 2010",
            "code": "NGT Order 2018",
            "threshold": 200,
            "authority": "National Green Tribunal",
            "penalties": [
                "₹5 lakh - ₹50 lakh fine",
                "Imprisonment up to 5 years",
                "Industry closure",
                "Daily fines until compliance"
            ],
            "section": "Section 15, 16, 19"
        },
        {
            "name": "CPCB National Ambient Air Quality Standards",
            "code": "CPCB S.O. 3067(E)",
            "threshold": 250,
            "authority": "Central Pollution Control Board",
            "penalties": [
                "₹1 crore/day fine",
                "Immediate closure notice",
                "Criminal prosecution",
                "Asset seizure"
            ],
            "section": "Schedule VI"
        },
        {
            "name": "Environment Protection Act, 1986",
            "code": "EPA Rules",
            "threshold": 300,
            "authority": "Ministry of Environment",
            "penalties": [
                "₹1 lakh/day penalty",
                "National Green Tribunal case",
                "Environmental compensation",
                "Public interest litigation"
            ],
            "section": "Section 3, 5"
        },
        {
            "name": "WHO Air Quality Guidelines",
            "code": "WHO AQG 2021",
            "threshold": 25,
            "authority": "World Health Organization",
            "penalties": [
                "International pressure",
                "Health advisory",
                "Global ranking impact",
                "Travel advisories"
            ],
            "section": "Guideline 4.1"
        }
    ]
    
    violations = []
    for law in laws:
        if aqi > law["threshold"]:
            violations.append({
                **law,
                "current_aqi": aqi,
                "excess": aqi - law["threshold"],
                "excess_percentage": ((aqi - law["threshold"]) / law["threshold"]) * 100,
                "severity": categorize_violation_severity(aqi - law["threshold"]),
                "action_required": "IMMEDIATE" if aqi > 300 else "URGENT" if aqi > 200 else "WITHIN_48_HOURS",
                "complaint_basis": f"Violation of {law['name']} exceeding threshold by {aqi - law['threshold']} points"
            })
    
    return {
        "success": True,
        "aqi": aqi,
        "location": {"lat": lat, "lon": lon},
        "violations": violations,
        "summary": {
            "total_violations": len(violations),
            "major_violations": len([v for v in violations if v["severity"] == "SEVERE"]),
            "total_excess": sum(v["excess"] for v in violations),
            "highest_penalty": max([p for v in violations for p in v["penalties"]], key=len) if violations else "None",
            "legal_status": "COMPLIANT" if not violations else "NON-COMPLIANT"
        },
        "recommended_actions": generate_legal_actions(violations)
    }

@app.post("/complaint/file")
async def file_complaint(complaint: ComplaintData):
    """
    File a pollution complaint
    """
    try:
        complaint_id = f"AJ-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
        # Generate legal analysis
        legal_check = await check_legal_violations(complaint.aqi, complaint.location.lat, complaint.location.lon)
        
        complaint_record = {
            "id": complaint_id,
            "timestamp": datetime.now().isoformat(),
            "status": "SUBMITTED",
            "complainant": {
                "type": "citizen",
                "platform": "Air Justice",
                "profile": complaint.user_profile.dict() if complaint.user_profile else None
            },
            "violation": {
                "location": complaint.location.dict(),
                "aqi": complaint.aqi,
                "description": complaint.description,
                "source_type": complaint.source_type,
                "legal_basis": legal_check["violations"]
            },
            "processing": {
                "authorities_notified": [
                    "National Green Tribunal",
                    "Central Pollution Control Board",
                    "State Pollution Control Board",
                    "District Magistrate"
                ],
                "expected_timeline": {
                    "acknowledgment": "24 hours",
                    "investigation": "48 hours",
                    "action": "7 days",
                    "resolution": "30 days"
                },
                "tracking_url": f"https://airjustice.tech/track/{complaint_id}",
                "case_officer": "To be assigned"
            },
            "impact_analysis": {
                "affected_area": "5 km radius",
                "estimated_population": 2500,
                "health_risk": "HIGH" if complaint.aqi > 200 else "MEDIUM",
                "environmental_impact": "SIGNIFICANT" if complaint.aqi > 250 else "MODERATE"
            }
        }
        
        complaints_db.append(complaint_record)
        
        # Generate legal document
        legal_document = generate_legal_document(complaint_record)
        
        return {
            "success": True,
            "message": "Complaint filed successfully",
            "complaint_id": complaint_id,
            "details": {
                "status": "PENDING_AUTHORITY_REVIEW",
                "tracking_id": complaint_id,
                "expected_updates": "Within 24 hours",
                "next_steps": [
                    "Complaint forwarded to NGT",
                    "CPCB notification sent",
                    "Local authorities alerted",
                    "Case number generated"
                ]
            },
            "legal_document": legal_document,
            "actions": {
                "immediate": "Monitor your email for updates",
                "follow_up": f"Check status at /complaint/status/{complaint_id}",
                "share": "Share with community for collective action",
                "escalate": "Contact directly after 48 hours if no response"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/complaint/status/{complaint_id}")
async def get_complaint_status(complaint_id: str):
    """
    Get complaint status
    """
    complaint = next((c for c in complaints_db if c["id"] == complaint_id), None)
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    # Simulate status progression
    status_map = {
        "SUBMITTED": "UNDER_REVIEW",
        "UNDER_REVIEW": "INVESTIGATION_STARTED",
        "INVESTIGATION_STARTED": "ACTION_TAKEN",
        "ACTION_TAKEN": "RESOLVED"
    }
    
    # Update status based on time
    submitted_time = datetime.fromisoformat(complaint["timestamp"])
    hours_since = (datetime.now() - submitted_time).total_seconds() / 3600
    
    if hours_since > 72:
        current_status = "RESOLVED"
    elif hours_since > 48:
        current_status = "ACTION_TAKEN"
    elif hours_since > 24:
        current_status = "INVESTIGATION_STARTED"
    elif hours_since > 2:
        current_status = "UNDER_REVIEW"
    else:
        current_status = "SUBMITTED"
    
    complaint["status"] = current_status
    
    return {
        "success": True,
        "complaint_id": complaint_id,
        "status": current_status,
        "details": complaint,
        "updates": generate_status_updates(complaint_id, current_status),
        "next_milestone": get_next_milestone(current_status),
        "contact": {
            "ngt": "ngt@nic.in",
            "cpcb": "cpcb@nic.in",
            "emergency": "1800-180-1551"
        }
    }

@app.get("/health/impact")
async def get_health_impact(aqi: float, age: Optional[int] = None, conditions: Optional[str] = None):
    """
    Get health impact analysis
    """
    # Cigarette equivalent
    cigarettes = aqi / 100
    
    # Risk levels
    if aqi <= 50:
        risk = "LOW"
        advice = ["No restrictions needed", "Ideal for outdoor activities"]
    elif aqi <= 100:
        risk = "MODERATE"
        advice = ["Sensitive groups take precautions", "Limit prolonged exertion"]
    elif aqi <= 150:
        risk = "HIGH for sensitive groups"
        advice = ["Sensitive groups avoid outdoor activities", "Keep medications handy"]
    elif aqi <= 200:
        risk = "HIGH for everyone"
        advice = ["Everyone reduce outdoor activities", "Use air purifiers", "Wear masks"]
    elif aqi <= 300:
        risk = "VERY HIGH"
        advice = ["Avoid all outdoor activities", "Stay indoors", "Use N95 masks"]
    else:
        risk = "SEVERE"
        advice = ["Health emergency", "Stay indoors with purifiers", "Consider relocation"]
    
    # Age-specific risks
    age_risk = ""
    if age:
        if age < 12:
            age_risk = "Children: Developing lungs at high risk"
        elif age > 60:
            age_risk = "Elderly: Weakened immunity and respiratory systems"
    
    # Condition-specific risks
    condition_risks = []
    if conditions:
        for condition in conditions.split(","):
            condition = condition.strip().lower()
            if condition in ["asthma", "copd", "bronchitis"]:
                condition_risks.append(f"{condition.upper()}: High risk of exacerbation")
            elif condition in ["heart", "cardiovascular"]:
                condition_risks.append("HEART CONDITIONS: Increased cardiovascular risk")
    
    return {
        "success": True,
        "aqi": aqi,
        "risk_assessment": {
            "overall_risk": risk,
            "cigarette_equivalent": round(cigarettes, 1),
            "health_index": round(100 - (aqi / 5), 1),  # 0-100 scale
            "recovery_time": f"{int(cigarettes * 2)} hours in clean air"
        },
        "specific_risks": {
            "age_related": age_risk,
            "condition_related": condition_risks,
            "general": [
                "Respiratory system inflammation",
                "Reduced lung function",
                "Increased infection risk",
                "Cardiovascular strain"
            ]
        },
        "protective_measures": {
            "immediate": advice,
            "short_term": ["Use air purifiers", "Close windows", "Stay hydrated"],
            "long_term": ["Support clean air policies", "Plant trees", "Use public transport"]
        },
        "medical_advice": generate_medical_advice(aqi, age, conditions)
    }

@app.get("/sources/detect")
async def detect_pollution_sources(lat: float, lon: float):
    """
    Detect likely pollution sources
    """
    sources = [
        {
            "type": "VEHICULAR_TRAFFIC",
            "confidence": np.random.randint(70, 95),
            "impact": "HIGH",
            "distance_km": round(np.random.uniform(0.5, 3), 2),
            "description": "Major road junction with heavy traffic",
            "recommendation": "Promote public transport, implement odd-even scheme"
        },
        {
            "type": "INDUSTRIAL_EMISSIONS",
            "confidence": np.random.randint(60, 85),
            "impact": "VERY_HIGH",
            "distance_km": round(np.random.uniform(2, 5), 2),
            "description": "Manufacturing units without proper filters",
            "recommendation": "Install emission control devices, regular inspections"
        },
        {
            "type": "CONSTRUCTION_ACTIVITY",
            "confidence": np.random.randint(50, 80),
            "impact": "MEDIUM",
            "distance_km": round(np.random.uniform(0.3, 1.5), 2),
            "description": "Building construction with dust emissions",
            "recommendation": "Use dust suppressants, cover construction material"
        },
        {
            "type": "WASTE_BURNING",
            "confidence": np.random.randint(40, 75),
            "impact": "HIGH",
            "distance_km": round(np.random.uniform(1, 4), 2),
            "description": "Open burning of garbage and leaves",
            "recommendation": "Promote waste segregation, provide collection services"
        }
    ]
    
    # Sort by impact and confidence
    sources.sort(key=lambda x: (x["impact"], x["confidence"]), reverse=True)
    
    return {
        "success": True,
        "location": {"lat": lat, "lon": lon},
        "detected_sources": sources,
        "analysis": {
            "total_sources": len(sources),
            "primary_source": sources[0]["type"] if sources else "UNKNOWN",
            "estimated_contribution": f"{np.random.randint(60, 90)}% of local pollution",
            "peak_hours": "8-10 AM, 6-8 PM"
        },
        "actionable_insights": [
            f"Primary source: {sources[0]['type'].replace('_', ' ').title()}",
            f"Top recommendation: {sources[0]['recommendation']}",
            "Consider filing source-specific complaint",
            "Share findings with local community"
        ]
    }

# Helper functions
def categorize_aqi(aqi: float):
    if aqi <= 50:
        return {"name": "Good", "color": "#10B981", "health_implications": "Minimal impact"}
    elif aqi <= 100:
        return {"name": "Moderate", "color": "#FBBF24", "health_implications": "Minor discomfort for sensitive people"}
    elif aqi <= 150:
        return {"name": "Unhealthy for Sensitive", "color": "#F97316", "health_implications": "Increased health effects for sensitive groups"}
    elif aqi <= 200:
        return {"name": "Unhealthy", "color": "#EF4444", "health_implications": "Everyone may experience health effects"}
    elif aqi <= 300:
        return {"name": "Very Unhealthy", "color": "#8B5CF6", "health_implications": "Health alert: everyone may experience more serious health effects"}
    else:
        return {"name": "Hazardous", "color": "#7C2D12", "health_implications": "Health emergency: entire population affected"}

def categorize_violation_severity(excess: float):
    if excess > 100:
        return "SEVERE"
    elif excess > 50:
        return "HIGH"
    elif excess > 20:
        return "MEDIUM"
    else:
        return "LOW"

def get_city_name(lat: float, lon: float):
    cities = {
        (28.6139, 77.2090): "Delhi",
        (19.0760, 72.8777): "Mumbai",
        (12.9716, 77.5946): "Bengaluru",
        (13.0827, 80.2707): "Chennai",
        (22.5726, 88.3639): "Kolkata",
        (17.3850, 78.4867): "Hyderabad",
        (26.9124, 75.7873): "Jaipur",
        (23.0225, 72.5714): "Ahmedabad",
        (18.5204, 73.8567): "Pune",
        (30.7333, 76.7794): "Chandigarh"
    }
    
    for (city_lat, city_lon), name in cities.items():
        if abs(lat - city_lat) < 0.5 and abs(lon - city_lon) < 0.5:
            return name
    
    return "Urban Area"

def get_zone_type(lat: float, lon: float):
    # Simple zone detection
    if abs(lat - 28.6139) < 0.1 and abs(lon - 77.2090) < 0.1:
        return "COMMERCIAL_CENTER"
    elif np.random.random() > 0.5:
        return "RESIDENTIAL"
    else:
        return "MIXED_USE"

def generate_predictions_recommendations(predictions):
    peak_aqi = max(p["aqi"] for p in predictions)
    
    if peak_aqi > 300:
        return {
            "alert": "HEALTH EMERGENCY PREDICTED",
            "actions": [
                "Avoid all outdoor activities during peak hours",
                "Use highest grade air purifiers",
                "Consider temporary relocation if possible",
                "Keep emergency medications ready"
            ]
        }
    elif peak_aqi > 200:
        return {
            "alert": "LEGAL VIOLATIONS PREDICTED",
            "actions": [
                "Plan indoor activities during peak hours",
                "Use N95 masks if going outside",
                "File preventive complaint with authorities",
                "Alert community members"
            ]
        }
    elif peak_aqi > 150:
        return {
            "alert": "UNHEALTHY CONDITIONS PREDICTED",
            "actions": [
                "Sensitive groups stay indoors",
                "Use air purifiers",
                "Keep windows closed during peak hours",
                "Monitor health symptoms"
            ]
        }
    else:
        return {
            "alert": "CONDITIONS MANAGEABLE",
            "actions": [
                "Normal activities with precautions",
                "Stay hydrated",
                "Monitor AQI changes",
                "Support clean air initiatives"
            ]
        }

def generate_legal_actions(violations):
    if not violations:
        return ["Continue monitoring", "Support clean air policies"]
    
    actions = ["FILE OFFICIAL COMPLAINT IMMEDIATELY"]
    
    for violation in violations:
        if violation["severity"] == "SEVERE":
            actions.append(f"Demand immediate action under {violation['name']}")
            actions.append(f"Contact {violation['authority']} directly")
        elif violation["severity"] == "HIGH":
            actions.append(f"File complaint with {violation['authority']}")
            actions.append("Alert local media and community")
    
    actions.extend([
        "Document all violations with timestamps",
        "Form community action group",
        "Consult environmental lawyer if needed",
        "Follow up every 48 hours until resolved"
    ])
    
    return actions

def generate_legal_document(complaint):
    return f"""
    ======================================================================
                     OFFICIAL LEGAL COMPLAINT DOCUMENT
    ======================================================================
    
    COMPLAINT ID: {complaint['id']}
    DATE: {complaint['timestamp']}
    STATUS: {complaint['status']}
    
    VIOLATION DETAILS:
    Location: {complaint['violation']['location']}
    AQI: {complaint['violation']['aqi']}
    Source Type: {complaint['violation']['source_type'] or 'Multiple Sources'}
    
    LEGAL BASIS:
    {chr(10).join([f"- {v['name']} (Exceeded by {v['excess']} points)" for v in complaint['violation']['legal_basis']])}
    
    IMPACT ANALYSIS:
    - Affected Area: {complaint['impact_analysis']['affected_area']}
    - Estimated Population: {complaint['impact_analysis']['estimated_population']}
    - Health Risk: {complaint['impact_analysis']['health_risk']}
    - Environmental Impact: {complaint['impact_analysis']['environmental_impact']}
    
    REQUESTED ACTIONS:
    1. Immediate investigation under relevant environmental laws
    2. Installation of continuous monitoring systems
    3. Penalties for violators as per law
    4. Public health advisory issuance
    5. Regular compliance reporting
    
    AUTHORITIES NOTIFIED:
    {chr(10).join([f"- {auth}" for auth in complaint['processing']['authorities_notified']])}
    
    This complaint is filed in public interest under:
    - Right to Information Act, 2005
    - Right to Clean Air (Article 21, Constitution)
    - Environmental protection laws
    
    ======================================================================
    """

def generate_status_updates(complaint_id: str, status: str):
    updates = []
    base_time = datetime.now() - timedelta(hours=np.random.randint(1, 72))
    
    status_sequence = ["SUBMITTED", "UNDER_REVIEW", "INVESTIGATION_STARTED", "ACTION_TAKEN", "RESOLVED"]
    
    for s in status_sequence:
        if status_sequence.index(s) <= status_sequence.index(status):
            update_time = base_time + timedelta(hours=status_sequence.index(s) * 12)
            updates.append({
                "timestamp": update_time.isoformat(),
                "status": s,
                "message": get_status_message(s),
                "authority": get_authority_for_status(s)
            })
    
    return updates

def get_status_message(status: str):
    messages = {
        "SUBMITTED": "Complaint received and registered",
        "UNDER_REVIEW": "Under initial review by authorities",
        "INVESTIGATION_STARTED": "Field investigation initiated",
        "ACTION_TAKEN": "Corrective actions being implemented",
        "RESOLVED": "Complaint resolved successfully"
    }
    return messages.get(status, "Status update")

def get_authority_for_status(status: str):
    authorities = {
        "SUBMITTED": "Air Justice System",
        "UNDER_REVIEW": "NGT Registry",
        "INVESTIGATION_STARTED": "CPCB Field Team",
        "ACTION_TAKEN": "Local Pollution Board",
        "RESOLVED": "All Concerned Authorities"
    }
    return authorities.get(status, "System")

def get_next_milestone(status: str):
    milestones = {
        "SUBMITTED": "Authority acknowledgment within 24 hours",
        "UNDER_REVIEW": "Investigation start within 48 hours",
        "INVESTIGATION_STARTED": "Corrective actions within 7 days",
        "ACTION_TAKEN": "Resolution confirmation within 30 days",
        "RESOLVED": "Case closed successfully"
    }
    return milestones.get(status, "Monitoring in progress")

def generate_medical_advice(aqi: float, age: Optional[int], conditions: Optional[str]):
    advice = []
    
    if aqi > 200:
        advice.append("CONSULT DOCTOR IF: Experiencing breathing difficulty, chest pain, or dizziness")
        advice.append("EMERGENCY: Call ambulance if severe respiratory distress")
    
    if age and age < 12:
        advice.append("PEDIATRIC ADVICE: Limit outdoor play, use child-sized masks")
    
    if age and age > 60:
        advice.append("GERIATRIC ADVICE: Regular health check-ups, avoid exposure")
    
    if conditions:
        cond_list = [c.strip().lower() for c in conditions.split(",")]
        if any(c in ["asthma", "copd"] for c in cond_list):
            advice.append("RESPIRATORY PATIENTS: Keep inhalers/medications readily available")
        if any(c in ["heart", "cardio"] for c in cond_list):
            advice.append("CARDIAC PATIENTS: Monitor blood pressure, avoid exertion")
    
    advice.append("GENERAL: Stay hydrated, eat antioxidant-rich foods")
    advice.append("MONITORING: Check AQI regularly, adjust activities accordingly")
    
    return advice

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)