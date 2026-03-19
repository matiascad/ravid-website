'use client';

import React, { useState, useEffect } from 'react';
import { Star, Heart, Shield, Instagram, Users, Quote, MessageCircle, Clock, Award, BookOpen, Target, Sparkles, Flame } from 'lucide-react';

export default function TuvalMemorialLanding() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    organization: '',
    message: ''
  });
  
  const [scrollY, setScrollY] = useState(0);
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setShowWhatsApp(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) {
      alert('אנא מלא את השדות החובה (שם וטלפון)');
      return;
    }
    
    const lines = [
      `שלום רביד, אשמח להזמין הרצאה.`,
      `שם: ${formData.name}`,
      `טלפון: ${formData.phone}`,
      formData.email ? `אימייל: ${formData.email}` : '',
      formData.organization ? `ארגון: ${formData.organization}` : '',
      formData.message ? `הודעה: ${formData.message}` : '',
    ].filter(Boolean).join('\n');
    
    const waUrl = `https://wa.me/972503112243?text=${encodeURIComponent(lines)}`;
    window.open(waUrl, '_blank');
    
    setFormData({
      name: '',
      phone: '',
      email: '',
      organization: '',
      message: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" dir="rtl">
      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/972503112243"
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-8 right-8 z-50 bg-green-500 text-white p-4 rounded-full shadow-memorial hover:bg-green-600 transition-all transform hover:scale-110 ${
          showWhatsApp ? 'translate-x-0 opacity-100' : 'translate-x-32 opacity-0'
        }`}
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-memorial-gradient">
        <div className="absolute inset-0 bg-memorial-light/5" />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto py-20">
          <div className="mb-8 inline-block animate-fade-up">
            <div className="w-56 h-56 mx-auto rounded-full bg-card border-4 border-border shadow-memorial-glow overflow-hidden animate-memorial-glow">
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Shield className="w-28 h-28 text-muted-foreground" />
              </div>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight animate-fade-up animation-delay-200">
            "בסוף הכל יהיה בסדר"
          </h1>
          
          <p className="text-2xl md:text-3xl mb-8 text-muted-foreground animate-fade-up animation-delay-400 max-w-3xl mx-auto">
            הרצאות מעוררות השראה להנצחת זכרו של סמ"ר תובל יעקב צנעני ז"ל - 
            סיפור של גבורה, אחווה ותקווה
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 animate-fade-up animation-delay-600">
            <div className="text-xl">
              <span className="font-bold">20.11.2003 - 04.12.2023</span>
            </div>
            <div className="hidden sm:block text-muted-foreground">•</div>
            <div className="text-xl">
              לוחם שריון • עוצבת ברק (188) • גדוד 53
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up animation-delay-800">
            <a 
              href="https://wa.me/972503112243?text=%D7%A9%D7%9C%D7%95%D7%9D%20%D7%A8%D7%91%D7%99%D7%93%2C%20%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A9%D7%9E%D7%95%D7%A2%20%D7%A2%D7%9C%20%D7%94%D7%96%D7%9E%D7%A0%D7%AA%20%D7%94%D7%A8%D7%A6%D7%90%D7%94"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-10 py-5 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-memorial"
            >
              <MessageCircle className="ml-3 w-6 h-6" />
              הזמן הרצאה בוואטסאפ
            </a>
            <a 
              href="#about" 
              className="inline-flex items-center px-10 py-5 bg-card text-foreground font-bold text-lg rounded-lg hover:bg-muted transition-all transform hover:scale-105 shadow-memorial"
            >
              קרא את הסיפור
              <BookOpen className="ml-3" />
            </a>
          </div>
        </div>
      </section>

      {/* Extended About Tuval Section */}
      <section id="about" className="py-24 px-4 bg-card">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-20 animate-fade-up">סיפורו של תובל - גיבור שלא ישכח</h2>
          
          <div className="space-y-20">
            {/* Personal Story */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h3 className="text-3xl font-bold mb-6">הנער שהפך ללוחם</h3>
                
                <p className="text-xl leading-relaxed animate-fade-up">
                  תובל יעקב צנעני נולד בקריית גת ביום כ' בחשוון תשס"ד (20.11.2003). 
                  כבר מגיל צעיר בלט באישיותו המיוחדת - נער עם חיוך מדבק, לב רחב ונכונות תמידית לעזור לזולת.
                </p>
                
                <p className="text-xl leading-relaxed animate-fade-up animation-delay-200">
                  בבית הספר היה תובל תלמיד אהוב על חבריו ומוריו. הוא האמין שבסוף הכל יהיה בסדר - 
                  משפט שהפך להיות המוטו שלו בחיים ושליווה אותו בכל צעד.
                </p>
                
                <p className="text-xl leading-relaxed animate-fade-up animation-delay-400">
                  כשהגיע זמנו להתגייס, לא היה לתובל ספק - הוא רצה להיות לוחם, להגן על המדינה ועל האנשים שהוא אוהב. 
                  הוא בחר בחיל השריון, שם הפך לתותחן מצטיין בטנק מרכבה.
                </p>
                
                <div className="bg-background p-8 rounded-lg shadow-memorial border-l-4 border-primary hover:shadow-memorial-glow transition-all duration-300 transform hover:-translate-y-1 animate-fade-up animation-delay-600">
                  <p className="text-2xl font-semibold italic text-center">
                    "תובל לימד אותנו שגבורה אמיתית היא לא רק בשדה הקרב, 
                    אלא ביכולת לחייך גם ברגעים הקשים ולהאמין שבסוף הכל יהיה בסדר"
                  </p>
                </div>
              </div>
              
              {/* Memorial Photos Grid */}
              <div className="space-y-6">
                <h4 className="text-2xl font-semibold text-center mb-4">זיכרונות מתובל</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted h-48 rounded-lg shadow-memorial hover:shadow-memorial-glow transition-all duration-300 transform hover:scale-105 animate-fade-up overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <span className="text-sm">תמונת ילדות</span>
                    </div>
                  </div>
                  <div className="bg-muted h-48 rounded-lg shadow-memorial hover:shadow-memorial-glow transition-all duration-300 transform hover:scale-105 animate-fade-up animation-delay-100 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <span className="text-sm">עם המשפחה</span>
                    </div>
                  </div>
                  <div className="bg-muted h-48 rounded-lg shadow-memorial hover:shadow-memorial-glow transition-all duration-300 transform hover:scale-105 animate-fade-up animation-delay-200 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <span className="text-sm">בטירונות</span>
                    </div>
                  </div>
                  <div className="bg-muted h-48 rounded-lg shadow-memorial hover:shadow-memorial-glow transition-all duration-300 transform hover:scale-105 animate-fade-up animation-delay-300 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <span className="text-sm">עם החברים ביחידה</span>
                    </div>
                  </div>
                </div>
                <p className="text-center text-muted-foreground mt-4">
                  תמונות אלו מספרות את סיפור חייו - מילדות שמחה ועד לוחם גאה
                </p>
              </div>
            </div>

            {/* Military Service */}
            <div className="bg-primary/10 p-12 rounded-2xl">
              <h3 className="text-3xl font-bold mb-8 text-center">השירות הצבאי - גאווה ומסירות</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <Shield className="w-20 h-20 mx-auto mb-4 text-primary" />
                  <h4 className="text-xl font-bold mb-2">עוצבת ברק (188)</h4>
                  <p className="text-lg">אחת העוצבות המובילות של חיל השריון, בעלת מורשת קרבית מפוארת</p>
                </div>
                <div className="text-center">
                  <Target className="w-20 h-20 mx-auto mb-4 text-primary" />
                  <h4 className="text-xl font-bold mb-2">גדוד 53</h4>
                  <p className="text-lg">גדוד הטנקים שבו שירת תובל כתותחן מצטיין ולוחם מסור</p>
                </div>
                <div className="text-center">
                  <Award className="w-20 h-20 mx-auto mb-4 text-primary" />
                  <h4 className="text-xl font-bold mb-2">סמ"ר לאחר נפילתו</h4>
                  <p className="text-lg">הועלה בדרגה כהוקרה על גבורתו ומסירותו בקרב</p>
                </div>
              </div>
            </div>

            {/* The Last Battle */}
            <div className="space-y-8">
              <h3 className="text-3xl font-bold text-center mb-8">הקרב האחרון - גבורה בחרבות ברזל</h3>
              
              <div className="bg-card p-10 rounded-lg shadow-memorial">
                <p className="text-xl leading-relaxed mb-6">
                  ביום כ"א בכסלו התשפ"ד (4 בדצמבר 2023), במסגרת מלחמת חרבות ברזל, 
                  יצא תובל עם צוות הטנק שלו למשימה קרבית ברצועת עזה. 
                  הם ידעו שהמשימה מסוכנת, אך היו נחושים להגן על מדינת ישראל.
                </p>
                
                <p className="text-xl leading-relaxed mb-6">
                  בקרב הקשה נפגע הטנק של תובל. יחד איתו נפלו שני חבריו הטובים - 
                  איתן פיש ויקיר ידידיה שינקולבסקי ז"ל. שלושה צעירים מלאי חיים, 
                  חלומות ותקוות, שנתנו את חייהם למען המולדת.
                </p>
                
                <p className="text-xl leading-relaxed font-semibold text-center">
                  תובל היה בן 20 בנופלו. צעיר שחי חיים מלאים באהבה, שמחה ומשמעות, 
                  והותיר אחריו מורשת של גבורה ותקווה שתמשיך לחיות לעד.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lecture Photos Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 animate-fade-up">מההרצאות שלי - רגעים של השראה</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="relative h-80 bg-muted rounded-lg shadow-memorial hover:shadow-memorial-glow transition-all duration-300 transform hover:scale-105 animate-fade-up overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground p-4 text-center">
                <div>
                  <Users className="w-16 h-16 mx-auto mb-2" />
                  <p className="font-semibold">הרצאה בעיר הבה"דים</p>
                  <p className="text-sm mt-2">מול 300 חיילים לפני כניסה לעזה</p>
                </div>
              </div>
            </div>
            
            <div className="relative h-80 bg-muted rounded-lg shadow-memorial hover:shadow-memorial-glow transition-all duration-300 transform hover:scale-105 animate-fade-up animation-delay-100 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground p-4 text-center">
                <div>
                  <BookOpen className="w-16 h-16 mx-auto mb-2" />
                  <p className="font-semibold">מכינה קדם צבאית</p>
                  <p className="text-sm mt-2">הכנת המלש"בים לשירות משמעותי</p>
                </div>
              </div>
            </div>
            
            <div className="relative h-80 bg-muted rounded-lg shadow-memorial hover:shadow-memorial-glow transition-all duration-300 transform hover:scale-105 animate-fade-up animation-delay-200 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground p-4 text-center">
                <div>
                  <Heart className="w-16 h-16 mx-auto mb-2" />
                  <p className="font-semibold">מפגש עם משפחות</p>
                  <p className="text-sm mt-2">שיח פתוח על אובדן ותקווה</p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-xl text-center text-muted-foreground max-w-3xl mx-auto">
            בכל הרצאה אני מביא את סיפורו של תובל, את המסרים שהוא הותיר, 
            ואת הכוח להמשיך הלאה עם אמונה שבסוף הכל יהיה בסדר
          </p>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">ההשפעה שלנו במספרים</h3>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="transform hover:scale-110 transition-all duration-300 animate-fade-up">
              <div className="text-6xl font-bold mb-3">300+</div>
              <p className="text-xl opacity-90">חיילים השתתפו</p>
              <p className="text-sm opacity-75 mt-2">לפני כניסה לרצועה</p>
            </div>
            <div className="transform hover:scale-110 transition-all duration-300 animate-fade-up animation-delay-100">
              <div className="text-6xl font-bold mb-3">15+</div>
              <p className="text-xl opacity-90">הרצאות הועברו</p>
              <p className="text-sm opacity-75 mt-2">ברחבי הארץ</p>
            </div>
            <div className="transform hover:scale-110 transition-all duration-300 animate-fade-up animation-delay-200">
              <div className="text-6xl font-bold mb-3">100%</div>
              <p className="text-xl opacity-90">המלצות חמות</p>
              <p className="text-sm opacity-75 mt-2">מכל הגופים</p>
            </div>
            <div className="transform hover:scale-110 transition-all duration-300 animate-fade-up animation-delay-300">
              <div className="text-6xl font-bold mb-3">∞</div>
              <p className="text-xl opacity-90">השראה וזיכרון</p>
              <p className="text-sm opacity-75 mt-2">שנשארים לתמיד</p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Lectures Info */}
      <section className="py-24 px-4 bg-card">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-20 animate-fade-up">ההרצאות שלי - מה תקבלו?</h2>
          
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div className="space-y-8">
              <h3 className="text-3xl font-bold mb-6">תוכן ההרצאה</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Flame className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">סיפור אישי נוגע ללב</h4>
                    <p className="text-lg text-muted-foreground">
                      אני מספר על תובל, על הילדות שלנו יחד, על החלומות שלו ועל הדרך שבחר. 
                      סיפור שמחבר את השומעים לדמות אמיתית ומעורר הזדהות עמוקה.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Sparkles className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">ערכים ומסרים לחיים</h4>
                    <p className="text-lg text-muted-foreground">
                      מתוך הסיפור עולים ערכים של אחווה, מסירות, אהבת המולדת, 
                      והכי חשוב - היכולת לראות את הטוב גם ברגעים הקשים.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Heart className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">כלים להתמודדות</h4>
                    <p className="text-lg text-muted-foreground">
                      אני משתף כיצד המשפחה שלנו מתמודדת עם האובדן, 
                      איך הופכים כאב לכוח ואיך ממשיכים קדימה עם זיכרון ותקווה.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <h3 className="text-3xl font-bold mb-6">התאמה לכל קהל</h3>
              
              <div className="space-y-4">
                <div className="bg-background p-6 rounded-lg shadow-memorial hover:shadow-memorial-glow transition-all">
                  <h4 className="font-bold text-xl mb-2">לחיילים ומלש"בים</h4>
                  <p>חיזוק לקראת השירות, הבנת המשמעות של להיות לוחם, והכוח של אחווה צבאית</p>
                </div>
                
                <div className="bg-background p-6 rounded-lg shadow-memorial hover:shadow-memorial-glow transition-all">
                  <h4 className="font-bold text-xl mb-2">לתלמידים ונוער</h4>
                  <p>השראה לחיים, חשיבות הערכים, ואיך כל אחד יכול להשפיע ולתרום למדינה</p>
                </div>
                
                <div className="bg-background p-6 rounded-lg shadow-memorial hover:shadow-memorial-glow transition-all">
                  <h4 className="font-bold text-xl mb-2">לעובדי הייטק וחברות</h4>
                  <p>פרספקטיבה על החיים, חשיבות המשפחה והקהילה, ואיך לחיות חיים עם משמעות</p>
                </div>
                
                <div className="bg-background p-6 rounded-lg shadow-memorial hover:shadow-memorial-glow transition-all">
                  <h4 className="font-bold text-xl mb-2">למנהיגים ומקבלי החלטות</h4>
                  <p>הבנת המחיר האנושי, חשיבות התמיכה במשפחות השכולות, ומנהיגות בעתות משבר</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lecture Format */}
          <div className="bg-primary text-primary-foreground p-12 rounded-2xl">
            <h3 className="text-3xl font-bold mb-8 text-center">איך נראית הרצאה?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Clock className="w-16 h-16 mx-auto mb-4" />
                <h4 className="text-xl font-bold mb-2">45-60 דקות</h4>
                <p>משך ההרצאה מותאם לקהל ולצרכים שלכם</p>
              </div>
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto mb-4" />
                <h4 className="text-xl font-bold mb-2">אינטראקטיבי</h4>
                <p>שיח פתוח, שאלות ותשובות, ושיתוף חוויות</p>
              </div>
              <div className="text-center">
                <Target className="w-16 h-16 mx-auto mb-4" />
                <h4 className="text-xl font-bold mb-2">מותאם אישית</h4>
                <p>כל הרצאה מותאמת לקהל היעד ולמטרות שלכם</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Extended Testimonials */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-20 animate-fade-up">מה אומרים על ההרצאות?</h2>
          
          <div className="space-y-10">
            <div className="bg-card p-10 rounded-lg shadow-memorial hover:shadow-memorial-glow transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-transparent hover:border-primary animate-fade-up">
              <Quote className="w-16 h-16 text-muted-foreground mb-6" />
              <p className="text-2xl italic mb-6 leading-relaxed">
                "ממליץ בחום, הרצאה מרתקת, נותנת כוח וערכים כל פעם מחדש. 
                רביד מצליח להעביר את הסיפור של אחיו בצורה שנוגעת בכל אחד מהחיילים. 
                ההרצאה משאירה אותם עם מוטיבציה וכוח להמשיך במשימה החשובה שלהם."
              </p>
              <div className="flex items-center gap-4">
                <Shield className="w-12 h-12 text-primary" />
                <div>
                  <p className="font-bold text-xl">משפחת ברק גדוד 53 פלוגת גולן</p>
                  <p className="text-muted-foreground">יחידתו של תובל ז"ל</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card p-10 rounded-lg shadow-memorial hover:shadow-memorial-glow transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-transparent hover:border-primary animate-fade-up animation-delay-200">
              <Quote className="w-16 h-16 text-muted-foreground mb-6" />
              <p className="text-2xl italic mb-6 leading-relaxed">
                "המלצה חמה - הרצאה מעוררת השראה שנוגעת בלב ומשאירה חותם עמוק. 
                רביד מביא את סיפורו האישי בצורה כנה ופתוחה שגורמת לכל אחד לחשוב על החיים שלו, 
                על מה חשוב באמת ועל הכוח שיש בכל אחד מאיתנו להשפיע."
              </p>
              <div className="flex items-center gap-4">
                <Award className="w-12 h-12 text-primary" />
                <div>
                  <p className="font-bold text-xl">פורום הגבורה</p>
                  <p className="text-muted-foreground">ארגון למען לוחמי צה"ל</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose This Lecture */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-12 animate-fade-up">למה להזמין את ההרצאה הזו?</h3>
          
          <div className="space-y-8 text-xl leading-relaxed">
            <p className="animate-fade-up">
              כי בעולם שרץ קדימה, לפעמים צריך לעצור ולזכור מה באמת חשוב.
            </p>
            <p className="animate-fade-up animation-delay-200">
              כי סיפורו של תובל הוא סיפור של כולנו - על אהבה, על אומץ, ועל היכולת להאמין.
            </p>
            <p className="animate-fade-up animation-delay-400">
              כי כל אחד מאיתנו צריך לשמוע שגם ברגעים הכי קשים, בסוף הכל יהיה בסדר.
            </p>
          </div>
          
          <a href="https://wa.me/972503112243?text=%D7%A9%D7%9C%D7%95%D7%9D%20%D7%A8%D7%91%D7%99%D7%93%2C%20%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A9%D7%9E%D7%95%D7%A2%20%D7%A2%D7%9C%20%D7%94%D7%96%D7%9E%D7%A0%D7%AA%20%D7%94%D7%A8%D7%A6%D7%90%D7%94" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-10 py-5 mt-12 bg-green-500 text-white font-bold text-lg rounded-lg hover:bg-green-600 transition-all transform hover:scale-105 shadow-memorial animate-fade-up animation-delay-600">
            <MessageCircle className="ml-3 w-6 h-6" />
            הזמן הרצאה בוואטסאפ
          </a>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-24 px-4 bg-background">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-8 animate-fade-up">הזמן הרצאה</h2>
          <p className="text-xl text-center text-muted-foreground mb-16 animate-fade-up animation-delay-200">
            מלאו את הפרטים ונחזור אליכם בהקדם האפשרי
          </p>
          
          <div className="space-y-6 animate-fade-up animation-delay-400">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-semibold mb-2 group-focus-within:text-primary transition-colors">שם מלא *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary transition-all duration-300 hover:border-muted-foreground bg-background"
                  placeholder="הכנס את שמך"
                />
              </div>
              
              <div className="group">
                <label className="block text-sm font-semibold mb-2 group-focus-within:text-primary transition-colors">טלפון *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary transition-all duration-300 hover:border-muted-foreground bg-background"
                  placeholder="050-1234567"
                  dir="ltr"
                />
              </div>
            </div>
            
            <div className="group">
              <label className="block text-sm font-semibold mb-2 group-focus-within:text-primary transition-colors">אימייל</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary transition-all duration-300 hover:border-muted-foreground bg-background"
                placeholder="example@email.com"
                dir="ltr"
              />
            </div>
            
            <div className="group">
              <label className="block text-sm font-semibold mb-2 group-focus-within:text-primary transition-colors">שם הארגון/מוסד</label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary transition-all duration-300 hover:border-muted-foreground bg-background"
                placeholder="שם הארגון"
              />
            </div>
            
            <div className="group">
              <label className="block text-sm font-semibold mb-2 group-focus-within:text-primary transition-colors">הודעה</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary transition-all duration-300 hover:border-muted-foreground resize-none bg-background"
                placeholder="ספר/י לנו על האירוע, הקהל היעד, התאריך המבוקש ופרטים נוספים..."
              />
            </div>
            
            <button
              onClick={handleSubmit}
              className="w-full py-5 bg-primary text-primary-foreground font-bold text-lg rounded-lg hover:bg-primary/90 transition-all transform hover:scale-105 shadow-memorial hover:shadow-memorial-glow"
            >
              שלח פנייה דרך וואטסאפ
            </button>
          </div>
          
          <div className="mt-16 text-center animate-fade-up animation-delay-600">
            <p className="text-lg text-muted-foreground mb-6">צרו קשר ישירות:</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a href="https://wa.me/972503112243" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-xl hover:text-green-600 transition-all transform hover:scale-110 bg-green-50 px-8 py-4 rounded-full hover:bg-green-100 hover:shadow-memorial font-semibold">
                <MessageCircle className="w-6 h-6" />
                <span dir="ltr">WhatsApp: 050-311-2243</span>
              </a>
              <a href="https://instagram.com/ravid._.t" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-xl hover:text-pink-600 transition-all transform hover:scale-110 bg-pink-50 px-8 py-4 rounded-full hover:bg-pink-100 hover:shadow-memorial font-semibold">
                <Instagram className="w-6 h-6" />
                <span>@ravid._.t</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-10">
            <Star className="w-16 h-16 mx-auto mb-6 animate-memorial-glow" />
            <p className="text-2xl font-bold mb-3">לזכרו של סמ"ר תובל יעקב צנעני ז"ל</p>
            <p className="text-xl mb-2">בן 20 בנופלו • כ"א בכסלו התשפ"ד</p>
            <p className="text-xl">ולזכר חבריו איתן פיש ויקיר ידידיה שינקולבסקי ז"ל</p>
          </div>
          
          <div className="border-t border-primary-foreground/20 pt-8 mt-8">
            <p className="text-lg font-semibold mb-2">"בסוף הכל יהיה בסדר"</p>
            <p className="text-sm opacity-70">
              © 2025 כל הזכויות שמורות | נבנה באהבה להנצחת זכרו של תובל
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}