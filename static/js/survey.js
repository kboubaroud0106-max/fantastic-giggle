// Survey Navigation, Form Handling, and Translation Logic
const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
let currentSectionIndex = 0;
let currentLanguage = 'fr';

const translations = {
    fr: {
        section_indicator: "Section {num} sur {total}",
        percent_indicator: "{pct}% Complété",
        survey_title: "Le patrimoine des salles de cinéma fermées de Safi : mémoire, perceptions et perspectives de valorisation",
        survey_desc: "Madame, Monsieur, ce questionnaire s'inscrit dans le cadre d'une recherche universitaire portant sur le patrimoine des anciennes salles de cinéma de la ville de Safi. Votre témoignage est précieux : il contribuera à documenter une mémoire collective menacée et à réfléchir à l'avenir de ces lieux. Le questionnaire est anonyme et les réponses seront utilisées à des fins exclusivement scientifiques. Il n'y a pas de bonne ou de mauvaise réponse ; seul compte votre point de vue. Sa durée de remplissage est d'environ 10 à 15 minutes. Nous vous remercions vivement de votre participation.",
        
        // Section titles
        section_a_title: "Section A — Profil du répondant",
        section_b_title: "Section B — Mémoire et fréquentation des salles de cinéma",
        section_c_title: "Section C — Connaissance et identification des salles",
        section_d_title: "Section D — Selon vous, pourquoi les salles ont-elles fermé ?",
        section_e_title: "Section E — Représentations actuelles et attachement",
        section_f_title: "Section F — Patrimoine et avenir des salles",
        section_g_title: "Section G — Information et médias",
        section_h_title: "Section H — Suggestions et suite de l'enquête",
        
        // Questions A
        q1_title: "Q1. Vous êtes :",
        gender_female: "Une femme",
        gender_male: "Un homme",
        q2_title: "Q2. Votre tranche d'âge :",
        age_under18: "Moins de 18 ans",
        age_18_24: "18 – 24 ans",
        age_25_34: "25 – 34 ans",
        age_35_49: "35 – 49 ans",
        age_50_64: "50 – 64 ans",
        age_over65: "65 ans et plus",
        q3_title: "Q3. Votre quartier de résidence à Safi :",
        q3_placeholder: "Ex: Plateau, Medina, Biada...",
        q4_title: "Q4. Depuis combien de temps résidez-vous à Safi ?",
        dur_birth: "Depuis ma naissance",
        dur_over20: "Plus de 20 ans",
        dur_10_20: "Entre 10 et 20 ans",
        dur_5_10: "Entre 5 et 10 ans",
        dur_under5: "Moins de 5 ans",
        q5_title: "Q5. Votre niveau d'études :",
        edu_none: "Sans scolarité / primaire",
        edu_middle: "Collège",
        edu_high: "Lycée / baccalauréat",
        edu_uni_low: "Études supérieures (bac+2 à bac+4)",
        edu_uni_high: "Études supérieures (bac+5 et plus)",
        q6_title: "Q6. Votre situation professionnelle :",
        prof_student: "Élève / étudiant(e)",
        prof_private: "Salarié(e) du secteur privé",
        prof_public: "Fonctionnaire / secteur public",
        prof_independent: "Profession libérale / indépendant(e)",
        prof_merchant: "Commerçant(e) / artisan(e)",
        prof_unemployed: "Sans emploi / en recherche",
        prof_retired: "Retraité(e)",
        prof_housewife: "Au foyer",
        
        // Questions B
        q7_title: "Q7. Avez-vous déjà fréquenté une ou plusieurs salles de cinéma à Safi ?",
        yes: "Oui",
        no: "Non",
        q7_no_desc: "Non (Si vous cochez Non, le formulaire passera directement à la Section D)",
        q8_title: "Q8. À quelle(s) période(s) fréquentiez-vous ces salles ? (plusieurs réponses possibles)",
        p_before1980: "Avant 1980",
        p_1980s: "Années 1980",
        p_1990s: "Années 1990",
        p_2000s: "Années 2000",
        p_2010s: "Années 2010 et après",
        q9_title: "Q9. À l'époque, à quelle fréquence alliez-vous au cinéma à Safi ?",
        f_several_week: "Plusieurs fois par semaine",
        f_once_week: "Environ une fois par semaine",
        f_once_month: "Une à deux fois par mois",
        f_few_year: "Quelques fois par an",
        f_rarely: "Rarement / occasionnellement",
        q10_title: "Q10. Avec qui vous rendiez-vous habituellement au cinéma ? (plusieurs réponses possibles)",
        c_alone: "Seul(e)",
        c_family: "En famille",
        c_friends: "Avec des amis",
        c_couple: "En couple",
        c_neighbors: "Avec des voisins / collègues",
        q11_title: "Q11. Quels types de films alliez-vous voir principalement ? (plusieurs réponses possibles)",
        m_moroccan: "Films marocains",
        m_egyptian: "Films égyptiens / arabes",
        m_indian: "Films indiens",
        m_western: "Films américains / occidentaux",
        m_action: "Films d'action / aventure",
        other: "Autres :",
        specify_placeholder: "Précisez...",
        q12_title: "Q12. Décrivez un souvenir marquant lié à votre fréquentation des salles de cinéma de Safi (réponse libre) :",
        q12_placeholder: "Partagez vos anecdotes, émotions ou souvenirs particuliers...",
        
        // Questions C
        q13_title: "Q13. Citez les noms des salles de cinéma de Safi dont vous vous souvenez (ouvertes ou fermées) :",
        q13_placeholder: "Ex: Atlantide, Roxy, Regragui, etc...",
        q13_table_desc: "Pour les salles dont vous vous souvenez, merci de compléter le tableau ci-dessous (autant que possible) :",
        tbl_col_name: "Nom de la salle",
        tbl_col_loc: "Quartier / localisation",
        tbl_col_state: "Que sait-on de son état actuel ?",
        tbl_ex_name: "Ex: Atlantide",
        tbl_ex_loc: "Ex: Centre-ville",
        tbl_ex_state: "Ex: Fermé, ruiné...",
        btn_add_cinema: "+ Ajouter une salle",
        q14_title: "Q14. Selon vous, que sont devenues la plupart de ces anciennes salles aujourd'hui ? (plusieurs réponses possibles)",
        b_abandoned: "Abandonnées / à l'état de ruine",
        b_shops: "Transformées en commerces",
        b_parking: "Transformées en entrepôts / parkings",
        b_demolished: "Démolies",
        b_cultural: "Réaffectées à un autre usage culturel",
        dont_know: "Je ne sais pas",
        
        // Questions D (Likert titles)
        tbl_col_statement: "Énoncé",
        likert_1: "Pas du tout",
        likert_2: "Plutôt non",
        likert_3: "Neutre",
        likert_4: "Plutôt oui",
        likert_5: "Tout à fait",
        
        // Q15 Likert text
        q15_1_text: "La télévision et les chaînes satellitaires ont détourné le public.",
        q15_2_text: "Internet, le streaming et le téléchargement ont remplacé la salle.",
        q15_3_text: "Le piratage des films a nui aux salles.",
        q15_4_text: "Le prix des billets était devenu trop élevé.",
        q15_5_text: "Les salles étaient vétustes et mal entretenues.",
        q15_6_text: "La qualité ou le choix des films proposés s'est dégradé.",
        q15_7_text: "Le sentiment d'insécurité ou la mauvaise réputation des salles.",
        q15_8_text: "La hausse de la valeur des terrains a poussé à vendre les salles.",
        q15_9_text: "Le manque de soutien des pouvoirs publics à ces salles.",
        q15_10_text: "Les habitudes de sortie et de loisirs ont changé.",
        
        q16_title: "Q16. Parmi ces causes, quelle est selon vous la PLUS importante ? Précisez (une seule, réponse libre) :",
        q16_placeholder: "La cause principale selon vous...",
        
        // Questions E
        q17_title: "Q17. Indiquez votre degré d'accord avec les affirmations suivantes :",
        q17_1_text: "Ces anciennes salles me rappellent de bons souvenirs.",
        q17_2_text: "Leur fermeture représente une perte pour la ville de Safi.",
        q17_3_text: "Leur état actuel me paraît dégradé et désolant.",
        q17_4_text: "Je me sens personnellement attaché(e) à ces lieux.",
        q17_5_text: "Ces salles font partie de l'identité de Safi.",
        q17_6_text: "Les jeunes générations ignorent l'histoire de ces salles.",
        q18_title: "Q18. En un mot ou une expression, que représentent pour vous ces salles fermées aujourd'hui ? (réponse libre) :",
        q18_placeholder: "Ex: Nostalgie, Patrimoine gâché, Oubli...",
        
        // Questions F
        q19_title: "Q19. Indiquez votre degré d'accord avec les affirmations suivantes :",
        q19_1_text: "Ces salles font partie du patrimoine culturel de Safi.",
        q19_2_text: "Il faudrait préserver et réhabiliter au moins certaines d'entre elles.",
        q19_3_text: "Leur réhabilitation pourrait dynamiser le centre-ville.",
        q19_4_text: "Leur valorisation pourrait créer des emplois et des activités.",
        q19_5_text: "Je fréquenterais un lieu culturel créé dans une ancienne salle.",
        q19_6_text: "Les habitants devraient être associés aux décisions les concernant.",
        
        q20_title: "Q20. Si une ancienne salle de cinéma était réhabilitée, quel usage souhaiteriez-vous y voir ? (plusieurs réponses possibles)",
        u_cinema: "Une salle de cinéma de nouveau en activité",
        u_cinematheque: "Une cinémathèque / lieu de mémoire du cinéma",
        u_concert: "Une salle de spectacles et de concerts",
        u_center: "Un centre culturel polyvalent",
        u_library: "Une médiathèque / bibliothèque",
        u_coworking: "Un espace de travail partagé pour les jeunes créateurs",
        u_cafe: "Un café culturel / espace de rencontre",
        u_museum: "Un musée ou un espace d'exposition",
        q21_title: "Q21. Seriez-vous prêt(e) à soutenir un projet de valorisation de ces salles ? (plusieurs réponses possibles)",
        s_visitor: "En le fréquentant comme visiteur / public",
        s_volunteer: "En le participant à des actions bénévoles ou associatives",
        s_share: "En partageant des souvenirs, photos ou documents",
        s_finance: "Par un soutien financier (don, adhésion)",
        s_not_involved: "Je ne souhaite pas m'impliquer",
        
        // Questions G
        q22_title: "Q22. Avez-vous déjà vu, lu ou entendu un contenu (article, reportage, publication) sur les anciennes salles de cinéma de Safi ?",
        q22_no_desc: "Non (Si vous cochez Non, vous passerez directement à la question Q24)",
        q23_title: "Q23. Si oui, par quel(s) canal/canaux ? (plusieurs réponses possibles)",
        ch_press: "Presse écrite locale / nationale",
        ch_tv: "Télévision / radio",
        ch_social: "Réseaux sociaux (Facebook, Instagram, TikTok, YouTube…)",
        ch_web: "Sites web / blogs",
        ch_mouth: "Bouche-à-oreille / discussions",
        ch_expo: "Expositions, événements ou associations locales",
        q24_title: "Q24. Suivez-vous des pages ou groupes consacrés à la mémoire et au patrimoine de Safi ?",
        q25_title: "Q25. Indiquez votre degré d'accord avec les affirmations suivantes :",
        q25_1_text: "On parle trop peu de ces salles dans les médias locaux.",
        q25_2_text: "Les réseaux sociaux pourraient aider à faire connaître ce patrimoine.",
        q25_3_text: "J'aimerais en savoir plus sur l'histoire de ces salles.",
        
        // Questions H
        q26_title: "Q26. Souhaitez-vous ajouter un commentaire, un souvenir ou une suggestion ? (réponse libre) :",
        q26_placeholder: "Votre message...",
        q27_title: "Q27. Accepteriez-vous d'être recontacté(e) pour un entretien plus approfondi ?",
        q27_contact_title: "Si oui, vous pouvez laisser un moyen de contact (facultatif) :",
        q27_contact_placeholder: "Téléphone, e-mail, etc...",
        
        // Buttons / Modal
        btn_prev: "Précédent",
        btn_next: "Suivant",
        btn_submit: "Soumettre",
        modal_success_title: "Envoi réussi !",
        modal_success_desc: "Merci ! Votre participation a été enregistrée avec succès.",
        btn_reload: "Remplir à nouveau",
        
        // Warnings
        fill_required: "Veuillez remplir toutes les questions obligatoires avant de continuer.",
        conn_error: "Erreur de connexion avec le serveur local."
    },
    ar: {
        section_indicator: "القسم {num} من {total}",
        percent_indicator: "تم إكمال {pct}%",
        survey_title: "تراث قاعات السينما المغلقة بآسفي: الذاكرة، التمثلات وآفاق التثمين",
        survey_desc: "سيدتي، سيدي، تندرج هذه الاستمارة في إطار بحث جامعي حول تراث قاعات السينما القديمة والمغلقة بمدينة آسفي. شهادتكم قيمة جداً: ستساهم في توثيق ذاكرة جماعية مهددة بالزوال والتفكير في مستقبل هذه الفضاءات. هذه الاستمارة مجهولة الهوية وتستخدم الإجابات لأغراض علمية بحتة. لا توجد إجابة صحيحة أو خاطئة، بل ما يهمنا هو وجهة نظركم. يستغرق ملؤها حوالي 10 إلى 15 دقيقة. نشكركم جزيلاً على مشاركتكم.",
        
        section_a_title: "القسم أ — الملف الشخصي للمستجوب",
        section_b_title: "القسم ب — الذاكرة وتردد المواطنين على قاعات السينما",
        section_c_title: "القسم ج — معرفة وتحديد قاعات السينما",
        section_d_title: "القسم د — في نظركم، ما هي أسباب إغلاق القاعات ؟",
        section_e_title: "القسم هـ — التمثلات الحالية والارتباط بالسينما",
        section_f_title: "القسم و — التراث ومستقبل قاعات السينما",
        section_g_title: "القسم ز — الإعلام ووسائل الاتصال",
        section_h_title: "القسم ح — مقترحات ومتابعة الاستمارة",
        
        q1_title: "Q1. جنسكم :",
        gender_female: "أنثى",
        gender_male: "ذكر",
        q2_title: "Q2. فئتكم العمرية :",
        age_under18: "أقل من 18 سنة",
        age_18_24: "18 - 24 سنة",
        age_25_34: "25 - 34 سنة",
        age_35_49: "35 - 49 سنة",
        age_50_64: "50 - 64 سنة",
        age_over65: "65 سنة فما فوق",
        q3_title: "Q3. حي إقامتكم في آسفي :",
        q3_placeholder: "مثال: البلاطو، المدينة القديمة، بياضة...",
        q4_title: "Q4. منذ متى وأنت تقيم في آسفي ؟",
        dur_birth: "منذ ولادتي",
        dur_over20: "أكثر من 20 سنة",
        dur_10_20: "ما بين 10 و 20 سنة",
        dur_5_10: "ما بين 5 و 10 سنوات",
        dur_under5: "أقل من 5 سنوات",
        q5_title: "Q5. مستواكم الدراسي :",
        edu_none: "بدون تمدرس / ابتدائي",
        edu_middle: "إعدادي",
        edu_high: "ثانوي / بكالوريا",
        edu_uni_low: "دراسات عليا (بكالوريا + 2 إلى بكالوريا + 4)",
        edu_uni_high: "دراسات عليا (بكالوريا + 5 فما فوق)",
        q6_title: "Q6. وضعيتكم المهنية الحالية :",
        prof_student: "تلميذ(ة) / طالب(ة)",
        prof_private: "أجير(ة) بالقطاع الخاص",
        prof_public: "موظف(ة) بالقطاع العام",
        prof_independent: "مهنة حرة / مستقل(ة)",
        prof_merchant: "تاجر(ة) / حرفي(ة)",
        prof_unemployed: "عاطل(ة) عن العمل / يبحث",
        prof_retired: "متقاعد(ة)",
        prof_housewife: "في البيت",
        
        q7_title: "Q7. هل سبق لك أن زرت قاعة أو أكثر من قاعات السينما بآسفي ؟",
        yes: "نعم",
        no: "لا",
        q7_no_desc: "لا (في حالة اختيار 'لا'، ستنتقل الاستمارة مباشرة إلى القسم د)",
        q8_title: "Q8. في أي فترة أو فترات كنت ترتاد هذه القاعات ؟ (يمكن اختيار عدة أجوبة)",
        p_before1980: "قبل سنة 1980",
        p_1980s: "خلال الثمانينات (1980 - 1989)",
        p_1990s: "خلال التسعينات (1990 - 1999)",
        p_2000s: "خلال الألفينات (2000 - 2009)",
        p_2010s: "منذ 2010 فما فوق",
        q9_title: "Q9. في ذلك الوقت، ما هو معدل زيارتك للسينما بآسفي ؟",
        f_several_week: "عدة مرات في الأسبوع",
        f_once_week: "مرة واحدة في الأسبوع تقريباً",
        f_once_month: "مرة إلى مرتين في الشهر",
        f_few_year: "بضع مرات في السنة",
        f_rarely: "نادراً / في المناسبات فقط",
        q10_title: "Q10. مع من كنت تذهب للسينما عادة ؟ (يمكن اختيار عدة أجوبة)",
        c_alone: "بمفردي",
        c_family: "مع العائلة",
        c_friends: "مع الأصدقاء",
        c_couple: "مع الشريك(ة)",
        c_neighbors: "مع الجيران / الزملاء",
        q11_title: "Q11. ما هي أنواع الأفلام التي كنت تشاهدها بالأساس ؟ (يمكن اختيار عدة أجوبة)",
        m_moroccan: "أفلام مغربية",
        m_egyptian: "أفلام مصرية / عربية",
        m_indian: "أفلام هندية",
        m_western: "أفلام أمريكية / غربية",
        m_action: "أفلام حركة / مغامرات",
        other: "أخرى :",
        specify_placeholder: "حدد...",
        q12_title: "Q12. صف ذكرى بارزة مرتبطة بذهابك إلى قاعات السينما في آسفي (إجابة حرة) :",
        q12_placeholder: "شاركنا قصصك، مشاعرك أو ذكرياتك الخاصة...",
        
        q13_title: "Q13. اذكر أسماء قاعات السينما في آسفي التي تتذكرها (المفتوحة أو المغلقة) :",
        q13_placeholder: "مثال: أتلانتيد، روكسي، الركراكي، إلخ...",
        q13_table_desc: "بالنسبة للقاعات التي تتذكرها، يرجى ملء الجدول التالي قدر الإمكان :",
        tbl_col_name: "اسم القاعة",
        tbl_col_loc: "الحي / الموقع",
        tbl_col_state: "ماذا تعرف عن حالتها الحالية ؟",
        tbl_ex_name: "مثال: أتلانتيد",
        tbl_ex_loc: "مثال: وسط المدينة",
        tbl_ex_state: "مثال: مغلقة، مهدمة...",
        btn_add_cinema: "+ إضافة قاعة",
        q14_title: "Q14. في رأيك، ما الذي أصبحت عليه معظم هذه القاعات القديمة اليوم ؟ (يمكن اختيار عدة أجوبة)",
        b_abandoned: "مهجورة / في حالة خراب",
        b_shops: "تحولت إلى محلات تجارية",
        b_parking: "تحولت إلى مستودعات / مواقف سيارات",
        b_demolished: "هُدمت بالكامل",
        b_cultural: "أعيد استخدامها لأغراض ثقافية أخرى",
        dont_know: "لا أدري",
        
        tbl_col_statement: "البيان / العبارة",
        likert_1: "لا أوافق تماماً",
        likert_2: "لا أوافق نوعاً ما",
        likert_3: "محايد",
        likert_4: "أوافق نوعاً ما",
        likert_5: "أوافق تماماً",
        
        q15_1_text: "التلفزيون والقنوات الفضائية جذبت الجمهور بعيداً عن القاعات.",
        q15_2_text: "الإنترنت، البث المباشر (الستريمينغ) والتحميل عوضت قاعات السينما.",
        q15_3_text: "قرصنة الأفلام أضرت كثيراً بمداخيل القاعات.",
        q15_4_text: "سعر تذاكر السينما أصبح مرتفعاً جداً.",
        q15_5_text: "القاعات أصبحت متهالكة وتفتقر للصيانة والنظافة.",
        q15_6_text: "جودة وتنوع الأفلام المعروضة تراجعت بشكل كبير.",
        q15_7_text: "الشعور بعدم الأمان أو السمعة السيئة لبعض القاعات.",
        q15_8_text: "ارتفاع قيمة العقارات شجع الملاك على بيع قاعات السينما.",
        q15_9_text: "غياب الدعم والمواكبة من طرف الجهات والمسؤولين العموميين.",
        q15_10_text: "تغير عادات الترفيه والخروج لدى المواطنين.",
        
        q16_title: "Q16. من بين هذه الأسباب، ما هو السبب الأكثر أهمية في نظرك ؟ حدد (سبب واحد، إجابة حرة) :",
        q16_placeholder: "السبب الرئيسي في نظرك...",
        
        q17_title: "Q17. حدد درجة موافقتك على العبارات التالية :",
        q17_1_text: "هذه القاعات القديمة تعيد لي ذكريات جميلة.",
        q17_2_text: "إغلاق هذه القاعات يمثل خسارة ثقافية لمدينة آسفي.",
        q17_3_text: "حالتها الحالية تبدو لي متدهورة ومحزنة.",
        q17_4_text: "أشعر بارتباط شخصي وعاطفي بهذه الأماكن.",
        q17_5_text: "هذه القاعات تشكل جزءاً من هوية وتاريخ مدينة آسفي.",
        q17_6_text: "الأجيال الصاعدة لا تعرف شيئاً عن تاريخ هذه القاعات.",
        q18_title: "Q18. في كلمة أو تعبير بسيط، ماذا تمثل لك هذه القاعات المغلقة اليوم ؟ (إجابة حرة) :",
        q18_placeholder: "مثال: نوستالجيا، تراث ضائع، إهمال...",
        
        q19_title: "Q19. حدد درجة موافقتك على العبارات التالية :",
        q19_1_text: "هذه القاعات تعتبر جزءاً لا يتجزأ من التراث الثقافي لآسفي.",
        q19_2_text: "من الضروري حماية وإعادة تأهيل بعض هذه القاعات على الأقل.",
        q19_3_text: "إعادة تأهيلها يمكن أن ينشط ويحيي وسط المدينة.",
        q19_4_text: "تثمينها يمكن أن يخلق فرص عمل وأنشطة سياحية واقتصادية.",
        q19_5_text: "سأكون سعيداً بارتياد فضاء ثقافي منشأ في قاعة سينما قديمة.",
        q19_6_text: "يجب إشراك الساكنة المحلية في القرارات المتعلقة بمستقبلها.",
        
        q20_title: "Q20. إذا أُعيد تأهيل قاعة سينما قديمة، ما هو النشاط الذي تود رؤيته فيها ؟ (يمكن اختيار عدة أجوبة)",
        u_cinema: "قاعة سينما مفعلة من جديد لعرض الأفلام",
        u_cinematheque: "خزانة سينمائية (سينيماتيك) / فضاء لذاكرة السينما",
        u_concert: "قاعة للعروض المسرحية والموسيقية",
        u_center: "مركز ثقافي متعدد التخصصات",
        u_library: "خزانة وسائطية / مكتبة عمومية",
        u_coworking: "فضاء عمل مشترك للمبدعين الشباب",
        u_cafe: "مقهى ثقافي / فضاء للقاءات الفكرية",
        u_museum: "متحف أو فضاء للمعارض الفنية",
        q21_title: "Q21. هل أنت مستعد لدعم مشروع لتثمين هذه القاعات القديمة ؟ (يمكن اختيار عدة أجوبة)",
        s_visitor: "عبر زيارته وارتياده كجمهور وزائر مستمر",
        s_volunteer: "عبر المشاركة التطوعية في الأنشطة والجمعيات المساندة لها",
        s_share: "عبر مشاركة ذكريات وصور ووثائق قديمة عنها",
        s_finance: "عبر الدعم المالي المباشر (تبرعات، انخراط)",
        s_not_involved: "لا أود الانخراط في أي دعم حالياً",
        
        q22_title: "Q22. هل سبق لك أن شاهدت، قرأت أو سمعت محتوى إعلامياً (مقال، تقرير، منشور) حول سينمات آسفي القديمة ؟",
        q22_no_desc: "لا (في حالة اختيار 'لا'، ستنتقل مباشرة إلى السؤال Q24)",
        q23_title: "Q23. إذا كانت الإجابة نعم، عبر أي قناة ؟ (يمكن اختيار عدة أجوبة)",
        ch_press: "الصحافة المكتوبة المحلية أو الوطنية",
        ch_tv: "التلفزيون / الإذاعة",
        ch_social: "شبكات التواصل الاجتماعي (فيسبوك، إنستغرام، تيك توك، يوتيوب...)",
        ch_web: "مواقع إلكترونية / مدونات",
        ch_mouth: "التواصل الشفهي / النقاشات اليومية",
        ch_expo: "المعارض والفعاليات والجمعيات المحلية",
        q24_title: "Q24. هل تتابع صفحات أو مجموعات على الإنترنت مخصصة لذاكرة وتراث مدينة آسفي ؟",
        q25_title: "Q25. حدد درجة موافقتك على العبارات التالية :",
        q25_1_text: "الإعلام المحلي يتحدث قليلاً جداً عن هذه القاعات السينمائية.",
        q25_2_text: "الشبكات الاجتماعية يمكن أن تساعد في التعريف بهذا التراث التليد.",
        q25_3_text: "أود معرفة المزيد من المعلومات عن تاريخ هذه القاعات.",
        
        q26_title: "Q26. هل تود إضافة أي تعليق، ذكرى أو مقترح إضافي ؟ (إجابة حرة) :",
        q26_placeholder: "رسالتكم...",
        q27_title: "Q27. هل تقبل بالتواصل معك لاحقاً لإجراء مقابلة فردية أكثر عمقاً ؟",
        q27_contact_title: "إذا كانت الإجابة نعم، يرجى ترك وسيلة تواصل (اختياري) :",
        q27_contact_placeholder: "الهاتف، البريد الإلكتروني، إلخ...",
        
        btn_prev: "السابق",
        btn_next: "التالي",
        btn_submit: "إرسال الاستمارة",
        modal_success_title: "تم الإرسال بنجاح !",
        modal_success_desc: "شكراً لك ! لقد تم تسجيل مشاركتك بنجاح.",
        btn_reload: "ملء استمارة جديدة",
        
        fill_required: "يرجى ملء جميع الحقول الإلزامية قبل المتابعة.",
        conn_error: "خطأ في الاتصال بالخادم المحلي."
    },
    en: {
        section_indicator: "Section {num} of {total}",
        percent_indicator: "{pct}% Completed",
        survey_title: "The heritage of Safi's closed movie theaters: memory, perceptions and prospects for valorization",
        survey_desc: "Madam, Sir, this questionnaire is part of a university research project on the heritage of the former movie theaters in the city of Safi. Your testimony is valuable: it will contribute to documenting a threatened collective memory and reflecting on the future of these venues. The questionnaire is anonymous and responses will be used exclusively for scientific purposes. There is no right or wrong answer; only your point of view matters. It takes about 10 to 15 minutes to fill. We thank you very much for your participation.",
        
        section_a_title: "Section A — Respondent Profile",
        section_b_title: "Section B — Memory and Attendance of Movie Theaters",
        section_c_title: "Section C — Knowledge and Identification of Venues",
        section_d_title: "Section D — In your opinion, why did the theaters close?",
        section_e_title: "Section E — Current Representations and Attachment",
        section_f_title: "Section F — Heritage and Future of the Theaters",
        section_g_title: "Section G — Information and Media",
        section_h_title: "Section H — Suggestions and Follow-up of the Survey",
        
        q1_title: "Q1. You are:",
        gender_female: "A woman",
        gender_male: "A man",
        q2_title: "Q2. Your age group:",
        age_under18: "Under 18 years old",
        age_18_24: "18 – 24 years old",
        age_25_34: "25 – 34 years old",
        age_35_49: "35 – 49 years old",
        age_50_64: "50 – 64 years old",
        age_over65: "65 years old and older",
        q3_title: "Q3. Your neighborhood of residence in Safi:",
        q3_placeholder: "E.g. Plateau, Medina, Biada...",
        q4_title: "Q4. How long have you lived in Safi?",
        dur_birth: "Since my birth",
        dur_over20: "More than 20 years",
        dur_10_20: "Between 10 and 20 years",
        dur_5_10: "Between 5 and 10 years",
        dur_under5: "Less than 5 years",
        q5_title: "Q5. Your education level:",
        edu_none: "No schooling / primary school",
        edu_middle: "Middle school",
        edu_high: "High school / baccalaureate",
        edu_uni_low: "Higher education (bac+2 to bac+4)",
        edu_uni_high: "Higher education (bac+5 and above)",
        q6_title: "Q6. Your professional situation:",
        prof_student: "Pupil / student",
        prof_private: "Private sector employee",
        prof_public: "Civil servant / public sector",
        prof_independent: "Liberal profession / self-employed",
        prof_merchant: "Merchant / artisan",
        prof_unemployed: "Unemployed / looking for work",
        prof_retired: "Retired",
        prof_housewife: "Homemaker",
        
        q7_title: "Q7. Have you ever frequented one or more movie theaters in Safi?",
        yes: "Yes",
        no: "No",
        q7_no_desc: "No (If you choose No, the form will jump directly to Section D)",
        q8_title: "Q8. In which period(s) did you visit these theaters? (multiple choices possible)",
        p_before1980: "Before 1980",
        p_1980s: "1980s",
        p_1990s: "1990s",
        p_2000s: "2000s",
        p_2010s: "2010s and after",
        q9_title: "Q9. At the time, how often did you go to the cinema in Safi?",
        f_several_week: "Several times a week",
        f_once_week: "About once a week",
        f_once_month: "Once or twice a month",
        f_few_year: "A few times a year",
        f_rarely: "Rarely / occasionally",
        q10_title: "Q10. Who did you usually go to the cinema with? (multiple choices possible)",
        c_alone: "Alone",
        c_family: "With family",
        c_friends: "With friends",
        c_couple: "As a couple",
        c_neighbors: "With neighbors / colleagues",
        q11_title: "Q11. What types of films did you watch mainly? (multiple choices possible)",
        m_moroccan: "Moroccan films",
        m_egyptian: "Egyptian / Arab films",
        m_indian: "Indian films",
        m_western: "American / Western films",
        m_action: "Action / adventure films",
        other: "Others:",
        specify_placeholder: "Specify...",
        q12_title: "Q12. Describe a striking memory linked to your attendance at Safi's cinemas (free response):",
        q12_placeholder: "Share your anecdotes, emotions or special memories...",
        
        q13_title: "Q13. List the names of Safi's cinemas that you remember (open or closed):",
        q13_placeholder: "E.g. Atlantide, Roxy, Regragui, etc...",
        q13_table_desc: "For the theaters you remember, please complete the table below (as much as possible):",
        tbl_col_name: "Theater name",
        tbl_col_loc: "Neighborhood / location",
        tbl_col_state: "What is known about its current state?",
        tbl_ex_name: "E.g. Atlantide",
        tbl_ex_loc: "E.g. City center",
        tbl_ex_state: "E.g. Closed, ruined...",
        btn_add_cinema: "+ Add a theater",
        q14_title: "Q14. In your opinion, what has become of most of these former theaters today? (multiple choices possible)",
        b_abandoned: "Abandoned / in ruins",
        b_shops: "Converted into shops",
        b_parking: "Converted into warehouses / parking lots",
        b_demolished: "Demolished",
        b_cultural: "Reassigned to another cultural use",
        dont_know: "I don't know",
        
        tbl_col_statement: "Statement",
        likert_1: "Strongly disagree",
        likert_2: "Disagree",
        likert_3: "Neutral",
        likert_4: "Agree",
        likert_5: "Strongly agree",
        
        q15_1_text: "Television and satellite channels turned the public away.",
        q15_2_text: "Internet, streaming and downloading replaced cinemas.",
        q15_3_text: "Film piracy harmed the theaters.",
        q15_4_text: "Ticket prices had become too high.",
        q15_5_text: "The theaters were run-down and poorly maintained.",
        q15_6_text: "The quality or choices of films proposed degraded.",
        q15_7_text: "Feeling of insecurity or bad reputation of the theaters.",
        q15_8_text: "The rising value of land pushed owners to sell the theaters.",
        q15_9_text: "Lack of support from public authorities for these theaters.",
        q15_10_text: "Outing and leisure habits changed.",
        
        q16_title: "Q16. Among these causes, which one is in your opinion the MOST important? Specify (only one, free response):",
        q16_placeholder: "The primary cause in your opinion...",
        
        q17_title: "Q17. Indicate your level of agreement with the following statements:",
        q17_1_text: "These old theaters bring back good memories.",
        q17_2_text: "Their closure represents a loss for the city of Safi.",
        q17_3_text: "Their current state seems run-down and heartbreaking to me.",
        q17_4_text: "I feel personally attached to these places.",
        q17_5_text: "These theaters are part of Safi's identity.",
        q17_6_text: "Younger generations ignore the history of these theaters.",
        q18_title: "Q18. In one word or phrase, what do these closed theaters represent for you today? (free response):",
        q18_placeholder: "E.g. Nostalgia, Wasted heritage, Forgotten...",
        
        q19_title: "Q19. Indicate your level of agreement with the following statements:",
        q19_1_text: "These theaters are part of Safi's cultural heritage.",
        q19_2_text: "At least some of them should be preserved and rehabilitated.",
        q19_3_text: "Their rehabilitation could boost the city center.",
        q19_4_text: "Their valorization could create jobs and activities.",
        q19_5_text: "I would visit a cultural venue created in a former theater.",
        q19_6_text: "Residents should be involved in decisions concerning them.",
        
        q20_title: "Q20. If a former cinema was rehabilitated, what use would you like to see there? (multiple choices possible)",
        u_cinema: "A cinema back in operation",
        u_cinematheque: "A cinematheque / movie memory venue",
        u_concert: "A performance and concert hall",
        u_center: "A multipurpose cultural center",
        u_library: "A media library / library",
        u_coworking: "A shared workspace for young creators",
        u_cafe: "A cultural cafe / meeting space",
        u_museum: "A museum or exhibition space",
        q21_title: "Q21. Would you be ready to support a project of valorization for these theaters? (multiple choices possible)",
        s_visitor: "By visiting it as a visitor / public",
        s_volunteer: "By participating in volunteer or community actions",
        s_share: "By sharing memories, photos or documents",
        s_finance: "Through financial support (donation, membership)",
        s_not_involved: "I do not wish to get involved",
        
        q22_title: "Q22. Have you ever seen, read or heard content (article, report, publication) about Safi's old cinemas?",
        q22_no_desc: "No (If you check No, you will jump directly to question Q24)",
        q23_title: "Q23. If yes, through which channel(s)? (multiple choices possible)",
        ch_press: "Local / national written press",
        ch_tv: "Television / radio",
        ch_social: "Social networks (Facebook, Instagram, TikTok, YouTube…)",
        ch_web: "Websites / blogs",
        ch_mouth: "Word-of-mouth / discussions",
        ch_expo: "Exhibitions, events or local associations",
        q24_title: "Q24. Do you follow pages or groups dedicated to the memory and heritage of Safi?",
        q25_title: "Q25. Indicate your level of agreement with the following statements:",
        q25_1_text: "There is too little talk about these theaters in local media.",
        q25_2_text: "Social networks could help promote this heritage.",
        q25_3_text: "I would like to know more about the history of these theaters.",
        
        q26_title: "Q26. Would you like to add a comment, memory or suggestion? (free response):",
        q26_placeholder: "Your message...",
        q27_title: "Q27. Would you agree to be contacted again for a more in-depth interview?",
        q27_contact_title: "If yes, you can leave contact details (optional):",
        q27_contact_placeholder: "Phone, e-mail, etc...",
        
        btn_prev: "Previous",
        btn_next: "Next",
        btn_submit: "Submit",
        modal_success_title: "Submission successful!",
        modal_success_desc: "Thank you! Your participation has been successfully recorded.",
        btn_reload: "Fill out again",
        
        fill_required: "Please fill out all required questions before proceeding.",
        conn_error: "Connection error with local server."
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setupConditionalLogic();
    updateProgress();
    // Default to FR
    switchLanguage('fr');
});

function switchLanguage(lang) {
    if (!translations[lang]) return;
    currentLanguage = lang;
    
    // Toggle RTL/LTR layout based on Arabic selection
    if (lang === 'ar') {
        document.body.dir = 'rtl';
        document.body.classList.add('rtl-layout');
    } else {
        document.body.dir = 'ltr';
        document.body.classList.remove('rtl-layout');
    }
    
    // 1. Translate elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translations[lang][key]) {
            // Check if string contains variables to replace
            if (key === 'section_indicator') {
                const activeSections = getActiveSections();
                const currentSection = sections[currentSectionIndex];
                const activeIndex = activeSections.indexOf(currentSection);
                el.textContent = translations[lang][key]
                    .replace('{num}', activeIndex + 1)
                    .replace('{total}', activeSections.length);
            } else {
                el.textContent = translations[lang][key];
            }
        }
    });
    
    // 2. Translate elements with data-translate-placeholder attribute
    document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
        const key = el.getAttribute('data-translate-placeholder');
        if (translations[lang][key]) {
            el.setAttribute('placeholder', translations[lang][key]);
        }
    });
    
    updateProgress();
}

function getActiveSections() {
    const q7Val = document.querySelector('input[name="q7_visited_cinema"]:checked')?.value;
    if (q7Val === 'Non') {
        return ['A', 'D', 'E', 'F', 'G', 'H'];
    }
    return sections;
}

function updateProgress() {
    const activeSections = getActiveSections();
    const currentSection = sections[currentSectionIndex];
    const activeIndex = activeSections.indexOf(currentSection);
    
    const total = activeSections.length;
    const progressPercent = Math.round((activeIndex / (total - 1)) * 100);
    
    const progressBar = document.getElementById('progressBar');
    const sectionIndicator = document.getElementById('sectionIndicator');
    const percentIndicator = document.getElementById('percentIndicator');
    
    if (progressBar) progressBar.style.width = `${progressPercent}%`;
    if (percentIndicator) {
        let pctText = translations[currentLanguage]['percent_indicator'];
        percentIndicator.textContent = pctText.replace('{pct}', progressPercent);
    }
    
    if (sectionIndicator) {
        let indText = translations[currentLanguage]['section_indicator'];
        sectionIndicator.textContent = indText
            .replace('{num}', activeIndex + 1)
            .replace('{total}', total);
    }
}

function navigateSection(direction) {
    const activeSections = getActiveSections();
    const currentSection = sections[currentSectionIndex];
    const activeIndex = activeSections.indexOf(currentSection);
    
    if (direction === 1) {
        if (!validateSection(currentSection)) {
            showToast(translations[currentLanguage]['fill_required'], "error");
            return;
        }
    }
    
    const nextActiveIndex = activeIndex + direction;
    if (nextActiveIndex >= 0 && nextActiveIndex < activeSections.length) {
        const nextSection = activeSections[nextActiveIndex];
        
        document.querySelector(`.survey-section[data-section="${currentSection}"]`).classList.remove('active');
        currentSectionIndex = sections.indexOf(nextSection);
        document.querySelector(`.survey-section[data-section="${nextSection}"]`).classList.add('active');
        
        document.querySelector('.survey-intro').scrollIntoView({ behavior: 'smooth' });
        
        document.getElementById('btnPrev').disabled = (nextActiveIndex === 0);
        
        if (nextActiveIndex === activeSections.length - 1) {
            document.getElementById('btnNext').style.display = 'none';
            document.getElementById('btnSubmit').style.display = 'inline-block';
        } else {
            document.getElementById('btnNext').style.display = 'inline-block';
            document.getElementById('btnSubmit').style.display = 'none';
        }
        
        updateProgress();
    }
}

function validateSection(sectionLetter) {
    const sectionEl = document.querySelector(`.survey-section[data-section="${sectionLetter}"]`);
    const requiredInputs = sectionEl.querySelectorAll('[required]');
    
    let isValid = true;
    const checkedGroups = new Set();
    
    requiredInputs.forEach(input => {
        if (input.type === 'radio') {
            checkedGroups.add(input.name);
        } else if (!input.value.trim()) {
            isValid = false;
            input.classList.add('input-error');
        } else {
            input.classList.remove('input-error');
        }
    });
    
    checkedGroups.forEach(name => {
        const checked = sectionEl.querySelector(`input[name="${name}"]:checked`);
        if (!checked) {
            isValid = false;
            sectionEl.querySelectorAll(`input[name="${name}"]`).forEach(r => {
                r.closest('.choice-item')?.classList.add('group-error');
            });
        } else {
            sectionEl.querySelectorAll(`input[name="${name}"]`).forEach(r => {
                r.closest('.choice-item')?.classList.remove('group-error');
            });
        }
    });
    
    return isValid;
}

function setupConditionalLogic() {
    const q7Radios = document.querySelectorAll('input[name="q7_visited_cinema"]');
    const q7Wrapper = document.getElementById('q7_conditional_wrapper');
    
    q7Radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'Non') {
                q7Wrapper.style.display = 'none';
                clearInputsInside(q7Wrapper);
            } else {
                q7Wrapper.style.display = 'block';
            }
            updateProgress();
        });
    });
    
    const q22Radios = document.querySelectorAll('input[name="q22_seen_content"]');
    const q23Wrapper = document.getElementById('q23_conditional_wrapper');
    
    q22Radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'Non') {
                q23Wrapper.style.display = 'none';
                clearInputsInside(q23Wrapper);
            } else {
                q23Wrapper.style.display = 'block';
            }
        });
    });
    
    const q27Radios = document.querySelectorAll('input[name="q27_recontact"]');
    const q27Wrapper = document.getElementById('q27_conditional_wrapper');
    
    q27Radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'Oui') {
                q27Wrapper.style.display = 'block';
            } else {
                q27Wrapper.style.display = 'none';
                clearInputsInside(q27Wrapper);
            }
        });
    });
    
    const q11OtherChk = document.getElementById('q11_other_chk');
    const q11OtherInput = document.getElementById('q11_other_input');
    if (q11OtherChk && q11OtherInput) {
        q11OtherInput.addEventListener('focus', () => {
            q11OtherChk.checked = true;
        });
    }

    const q20OtherChk = document.getElementById('q20_other_chk');
    const q20OtherInput = document.getElementById('q20_other_input');
    if (q20OtherChk && q20OtherInput) {
        q20OtherInput.addEventListener('focus', () => {
            q20OtherChk.checked = true;
        });
    }
}

function clearInputsInside(container) {
    if (!container) return;
    container.querySelectorAll('input[type="text"], textarea').forEach(i => i.value = '');
    container.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(i => i.checked = false);
}

// Q13 Table Row management
function addCinemaRow() {
    const tbody = document.querySelector('#q13_table tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="text" class="form-input row-cinema-name" placeholder="${translations[currentLanguage]['tbl_ex_name']}"></td>
        <td><input type="text" class="form-input row-cinema-loc" placeholder="${translations[currentLanguage]['tbl_ex_loc']}"></td>
        <td><input type="text" class="form-input row-cinema-state" placeholder="${translations[currentLanguage]['tbl_ex_state']}"></td>
        <td style="text-align: center;"><button type="button" class="btn-icon" onclick="removeCinemaRow(this)">&times;</button></td>
    `;
    tbody.appendChild(tr);
}

function removeCinemaRow(btn) {
    const tr = btn.closest('tr');
    const tbody = tr.parentNode;
    if (tbody.querySelectorAll('tr').length > 1) {
        tr.remove();
    } else {
        tr.querySelectorAll('input').forEach(i => i.value = '');
    }
}

function showToast(message, type = "success") {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast-notif ${type}`;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 4000);
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    const currentSection = sections[currentSectionIndex];
    if (!validateSection(currentSection)) {
        showToast(translations[currentLanguage]['fill_required'], "error");
        return;
    }
    
    const formData = {};
    const form = document.getElementById('surveyForm');
    
    // 1. Collect single choices
    form.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
        formData[radio.name] = radio.value;
    });
    
    // 2. Collect text inputs and textareas
    form.querySelectorAll('input[type="text"], textarea').forEach(input => {
        if (!input.classList.contains('row-cinema-name') && 
            !input.classList.contains('row-cinema-loc') && 
            !input.classList.contains('row-cinema-state')) {
            formData[input.name] = input.value;
        }
    });
    
    // 3. Collect multiple choice lists
    const multiChoiceFields = ['q8_periods', 'q10_companions', 'q11_movie_types', 'q14_what_became', 'q20_desired_usage', 'q21_support_type', 'q23_channels'];
    multiChoiceFields.forEach(field => {
        formData[field] = [];
        form.querySelectorAll(`input[name="${field}"]:checked`).forEach(chk => {
            formData[field].push(chk.value);
        });
    });
    
    // 4. Collect Q13 Cinema Table rows
    formData['q13_table'] = [];
    const rows = form.querySelectorAll('#q13_table tbody tr');
    rows.forEach(row => {
        const name = row.querySelector('.row-cinema-name').value.trim();
        const location = row.querySelector('.row-cinema-loc').value.trim();
        const current_state = row.querySelector('.row-cinema-state').value.trim();
        
        if (name || location || current_state) {
            formData['q13_table'].push({ name, location, current_state });
        }
    });
    
    // Submit via AJAX
    fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            document.getElementById('successMessage').textContent = translations[currentLanguage]['modal_success_desc'];
            document.getElementById('confirmModal').style.display = 'flex';
        } else {
            showToast(data.message || "Une erreur est survenue.", "error");
        }
    })
    .catch(err => {
        console.error("Error submitting form:", err);
        showToast(translations[currentLanguage]['conn_error'], "error");
    });
}
