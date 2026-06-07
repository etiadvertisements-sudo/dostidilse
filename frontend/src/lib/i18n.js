import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

// Translation dictionary. Add keys as needed; missing keys fall back to English.
const dict = {
  // -------- NAV --------
  "nav.home": { en: "Home", hi: "होम" },
  "nav.about": { en: "About", hi: "हमारे बारे में" },
  "nav.projects": { en: "Projects", hi: "परियोजनाएँ" },
  "nav.join": { en: "Join Us", hi: "हमसे जुड़ें" },
  "nav.contact": { en: "Contact", hi: "संपर्क" },
  "nav.donate": { en: "Donate", hi: "दान करें" },
  "nav.toggle_menu": { en: "Toggle menu", hi: "मेनू खोलें" },
  "lang.toggle_aria": { en: "Switch language", hi: "भाषा बदलें" },

  // -------- HERO --------
  "hero.kicker": { en: "Because every child matters", hi: "क्योंकि हर बच्चा अनमोल है" },
  "hero.title_1": { en: "She walks", hi: "वह चलती है" },
  "hero.title_em": { en: "two hours", hi: "दो घंटे" },
  "hero.title_2": { en: "to read a book", hi: "एक किताब पढ़ने के लिए" },
  "hero.title_3": { en: "that isn't hers.", hi: "जो उसकी अपनी नहीं है।" },
  "hero.subtitle": {
    en: "Somewhere, a little girl is borrowing the same torn page for the third week. Somewhere, a boy is pretending hunger doesn't matter. At Dosti Dil Se, we believe a kind hand — shown up at the right moment — can quietly rewrite a childhood.",
    hi: "कहीं एक बच्ची तीसरे हफ़्ते भी वही फटा पन्ना उधार ले रही है। कहीं एक बच्चा भूख का बहाना बना रहा है। दोस्ती दिल से में हम मानते हैं कि सही समय पर बढ़ा एक मेहरबान हाथ चुपचाप किसी बचपन को नया लिख सकता है।",
  },
  "hero.cta_donate": { en: "Become part of their story", hi: "उनकी कहानी का हिस्सा बनें" },
  "hero.cta_mission": { en: "What we do", hi: "हम क्या करते हैं" },
  "hero.stat1_label": { en: "Every rupee counts", hi: "हर रुपया मायने रखता है" },
  "hero.stat2_label": { en: "Goes to the cause", hi: "सीधे काम के लिए" },
  "hero.badge_l1": { en: "One small step.", hi: "एक छोटा कदम।" },
  "hero.badge_l2": { en: "A thousand possibilities.", hi: "हज़ार संभावनाएँ।" },

  // -------- MISSION --------
  "mission.kicker": { en: "What We Do", hi: "हम क्या करते हैं" },
  "mission.title_1": { en: "Small gestures,", hi: "छोटे कदम," },
  "mission.title_em": { en: "big belonging.", hi: "बड़ा अपनापन।" },
  "mission.lead": {
    en: "Three causes, one promise — to show up with warmth and walk away only when the need is met.",
    hi: "तीन कारण, एक वादा — गर्मजोशी से आना और तभी जाना जब ज़रूरत पूरी हो।",
  },
  "mission.p1.title": { en: "Education", hi: "शिक्षा" },
  "mission.p1.desc": {
    en: "We show up where learning is hardest — the quiet support a child needs to dream further.",
    hi: "हम वहाँ पहुँचते हैं जहाँ पढ़ाई सबसे कठिन है — वह शांत सहारा जो किसी बच्चे को आगे सपने देखने देता है।",
  },
  "mission.p2.title": { en: "Nature Projects", hi: "प्रकृति परियोजनाएँ" },
  "mission.p2.desc": {
    en: "Tree plantations, clean-up drives, green classrooms — because caring for children means caring for their world.",
    hi: "पेड़ लगाना, सफ़ाई अभियान, हरे क्लासरूम — क्योंकि बच्चों की देखभाल उनकी दुनिया की देखभाल भी है।",
  },
  "mission.p3.title": { en: "Help for Anyone in Need", hi: "जो भी ज़रूरतमंद है, उसके लिए" },
  "mission.p3.desc": {
    en: "Whenever we can, wherever we can — without asking who, why, or how much.",
    hi: "जब भी हम कर सकें, जहाँ भी हम कर सकें — बिना यह पूछे कि कौन, क्यों या कितना।",
  },
  "mission.alt_studying": { en: "Children learning", hi: "बच्चे पढ़ाई करते हुए" },
  "mission.alt_planting": { en: "Planting for the future", hi: "भविष्य के लिए पौधे" },
  "mission.alt_serving": { en: "Children we serve", hi: "बच्चे जिनके लिए हम काम करते हैं" },

  // -------- IMPACT --------
  "impact.kicker": { en: "Transparency", hi: "पारदर्शिता" },
  "impact.title_1": { en: "We're starting today.", hi: "हम आज से शुरू कर रहे हैं।" },
  "impact.title_em": { en: "Every number begins at zero.", hi: "हर आँकड़ा शून्य से शुरू है।" },
  "impact.lead": {
    en: "We're building this from scratch — with honesty as our first currency. These numbers update live, so you'll always see where we stand.",
    hi: "हम यह काम शुरू से खड़ा कर रहे हैं — ईमानदारी हमारी पहली मुद्रा है। ये आँकड़े लाइव बदलते रहते हैं, ताकि आप हमेशा जान सकें हम कहाँ हैं।",
  },
  "impact.stat_students": { en: "Students Supported", hi: "सहायता प्राप्त छात्र" },
  "impact.stat_raised": { en: "Contributions Received", hi: "प्राप्त योगदान" },
  "impact.stat_hearts": { en: "Kind Hearts", hi: "दयालु दिल" },
  "impact.stat_projects": { en: "Projects Completed", hi: "पूरी हुई परियोजनाएँ" },
  "impact.promise_title": { en: "Our transparency promise", hi: "हमारा पारदर्शिता का वादा" },
  "impact.promise_text": {
    en: "100% of every contribution will go directly to the cause. We'll publish where your kindness went — which community, which school, which tree — so you can follow it from the moment it leaves your hands to the moment it reaches a child's.",
    hi: "हर योगदान का 100% सीधे काम पर जाएगा। हम बताएँगे कि आपकी दया कहाँ पहुँची — कौन सी बस्ती, कौन सा स्कूल, कौन सा पेड़ — ताकि आप अपने योगदान को आपके हाथ से किसी बच्चे के हाथ तक देख सकें।",
  },

  // -------- TEAM --------
  "team.kicker": { en: "The Heart Behind", hi: "इसके पीछे का दिल" },
  "team.title_1": { en: "Ordinary people,", hi: "साधारण लोग," },
  "team.title_em": { en: "extraordinary intent.", hi: "असाधारण इरादा।" },
  "team.lead": {
    en: "The hands and hearts who show up every day so a child somewhere can keep going. Hover to know them a little better.",
    hi: "वो हाथ और दिल जो रोज़ काम पर लगे हैं ताकि कहीं कोई बच्चा आगे बढ़ सके। उन्हें थोड़ा बेहतर जानने के लिए कार्ड पर माउस लाएँ।",
  },

  // -------- PROJECTS PREVIEW & PAGE --------
  "projects.kicker": { en: "Our Work", hi: "हमारा काम" },
  "projects.preview_title_1": { en: "Stories we're", hi: "कहानियाँ जो हम" },
  "projects.preview_title_em": { en: "writing together.", hi: "साथ मिलकर लिख रहे हैं।" },
  "projects.view_all": { en: "View all projects", hi: "सभी परियोजनाएँ देखें" },
  "projects.empty_quiet": {
    en: "Our first stories are being quietly written. Come back soon — or help us start one.",
    hi: "हमारी पहली कहानियाँ अभी चुपचाप लिखी जा रही हैं। जल्द लौटें — या एक नई कहानी शुरू कराने में मदद करें।",
  },
  "projects.start_story": { en: "Start a story", hi: "एक कहानी शुरू करें" },
  "projects.page_title_1": { en: "Every project,", hi: "हर परियोजना," },
  "projects.page_title_em": { en: "a small promise.", hi: "एक छोटा वादा।" },
  "projects.page_lead": {
    en: "Here's everything we're building — the ones behind us, and the ones ahead.",
    hi: "यहाँ है वह सब जो हम बना रहे हैं — जो पीछे है और जो आगे है।",
  },
  "projects.filter_all": { en: "All", hi: "सभी" },
  "projects.filter_completed": { en: "Completed", hi: "पूर्ण" },
  "projects.filter_upcoming": { en: "Upcoming", hi: "आगामी" },
  "projects.status_completed": { en: "completed", hi: "पूर्ण" },
  "projects.status_upcoming": { en: "upcoming", hi: "आगामी" },
  "projects.children": { en: "children", hi: "बच्चे" },
  "projects.empty_none": { en: "No projects here yet. The first one is on its way.", hi: "अभी यहाँ कोई परियोजना नहीं है। पहली रास्ते में है।" },
  "projects.loading": { en: "Loading…", hi: "लोड हो रहा है…" },

  // -------- DONATE --------
  "donate.kicker": { en: "Contribute", hi: "योगदान करें" },
  "donate.title_1": { en: "Your kindness,", hi: "आपकी दया," },
  "donate.title_em": { en: "their courage.", hi: "उनकी हिम्मत।" },
  "donate.lead": {
    en: "Every contribution — ten rupees or ten thousand — carries the same weight of kindness. Add your photo, and see your heart join our Wall of Hearts.",
    hi: "हर योगदान — दस रुपये हो या दस हज़ार — दया का वही भार रखता है। अपनी तस्वीर जोड़ें और अपने दिल को हमारी ‘दिलों की दीवार’ पर देखें।",
  },
  "donate.t1.label": { en: "A small hello", hi: "एक छोटी सी नमस्ते" },
  "donate.t1.note": { en: "Every rupee finds its way", hi: "हर रुपया अपनी जगह पाता है" },
  "donate.t2.label": { en: "A gentle hand", hi: "एक नर्म हाथ" },
  "donate.t2.note": { en: "Helps one child walk a little further", hi: "एक बच्चे को थोड़ा आगे चलने में मदद" },
  "donate.t3.label": { en: "A brighter start", hi: "एक चमकीली शुरुआत" },
  "donate.t3.note": { en: "A fuller beginning for one child", hi: "एक बच्चे के लिए पूरी शुरुआत" },
  "donate.t4.label": { en: "A month of hope", hi: "एक महीने की उम्मीद" },
  "donate.t4.note": { en: "Supports five children", hi: "पाँच बच्चों का साथ" },
  "donate.custom_label": { en: "Or enter a custom amount", hi: "या अपनी राशि भरें" },
  "donate.custom_placeholder": { en: "e.g. 750", hi: "जैसे 750" },
  "donate.photo_label": { en: "Your photo", hi: "आपकी तस्वीर" },
  "donate.photo_sub": { en: "· joins our Wall of Hearts", hi: "· हमारी दिलों की दीवार पर लगेगी" },
  "donate.upload_photo": { en: "Upload photo", hi: "तस्वीर अपलोड करें" },
  "donate.change_photo": { en: "Change photo", hi: "तस्वीर बदलें" },
  "donate.photo_help": { en: "JPG/PNG · up to 1.2 MB · a happy face works best", hi: "JPG/PNG · 1.2 MB तक · खुशी से भरा चेहरा सबसे अच्छा लगता है" },
  "donate.gift_title": { en: "Name a child's dream", hi: "किसी बच्चे का सपना किसी के नाम करें" },
  "donate.gift_desc": {
    en: "Dedicate this contribution to someone — a birthday, an anniversary, a memory. We'll bake their name into your share card.",
    hi: "इस योगदान को किसी को समर्पित करें — जन्मदिन, सालगिरह या यादगार। हम उनका नाम आपके शेयर कार्ड पर लिखेंगे।",
  },
  "donate.gift_to_label": { en: "In whose name", hi: "किसके नाम पर" },
  "donate.gift_to_placeholder": { en: "e.g. Dadi, Arjun, Mom", hi: "जैसे दादी, अर्जुन, माँ" },
  "donate.gift_occ_label": { en: "Occasion", hi: "अवसर" },
  "donate.gift_occ_birthday": { en: "Birthday", hi: "जन्मदिन" },
  "donate.gift_occ_anniversary": { en: "Anniversary", hi: "सालगिरह" },
  "donate.gift_occ_memory": { en: "In loving memory", hi: "प्यारी याद में" },
  "donate.gift_occ_festival": { en: "Festival", hi: "त्योहार" },
  "donate.gift_occ_just": { en: "Just because", hi: "बस ऐसे ही" },
  "donate.your_name": { en: "Your name", hi: "आपका नाम" },
  "donate.name_placeholder": { en: "Who shall we thank?", hi: "हम किसका धन्यवाद करें?" },
  "donate.email": { en: "Email", hi: "ईमेल" },
  "donate.phone": { en: "Phone (optional)", hi: "फ़ोन (वैकल्पिक)" },
  "donate.message": { en: "Message (optional)", hi: "संदेश (वैकल्पिक)" },
  "donate.message_placeholder": { en: "A note of blessing", hi: "आशीर्वाद की एक पंक्ति" },
  "donate.contribute": { en: "Contribute", hi: "योगदान करें" },
  "donate.processing": { en: "Processing…", hi: "हो रहा है…" },
  "donate.footnote": { en: "Secure payments by Razorpay · 100% reaches the cause · Every rupee counts", hi: "Razorpay से सुरक्षित भुगतान · 100% काम पर · हर रुपया मायने रखता है" },

  // -------- WALL OF HEARTS --------
  "wall.kicker": { en: "Wall of Hearts", hi: "दिलों की दीवार" },
  "wall.title_1": { en: "The faces behind", hi: "हर मुस्कान के पीछे" },
  "wall.title_em": { en: "every smile we create.", hi: "एक चेहरा है।" },
  "wall.lead": {
    en: "Each photo here is a heart that chose to help. Every time someone new gives, this heart grows fuller — just like ours.",
    hi: "यहाँ हर तस्वीर एक दिल है जिसने मदद चुनी। जब-जब कोई नया देता है, यह दिल और भर जाता है — ठीक हमारी तरह।",
  },
  "wall.empty": { en: "The first heart on this wall could be yours.", hi: "इस दीवार का पहला दिल आपका हो सकता है।" },
  "wall.be_first": { en: "Be the first", hi: "पहले बनिए" },
  "wall.rotate_note": { en: "hearts are rotating above — each one a story.", hi: "दिल ऊपर बदल रहे हैं — हर एक एक कहानी।" },
  "wall.contributed": { en: "contributed", hi: "का योगदान" },
  "wall.in_name_of": { en: "In", hi: "" },
  "wall.in_name_suffix": { en: "'s name", hi: "के नाम" },

  // -------- ABOUT --------
  "about.kicker": { en: "About", hi: "हमारे बारे में" },
  "about.title_1": { en: "Born from", hi: "जन्मा" },
  "about.title_em": { en: "kitchens,", hi: "रसोइयों से," },
  "about.title_2": { en: "not boardrooms.", hi: "बोर्डरूम से नहीं।" },
  "about.lead": {
    en: "Dosti Dil Se was not planned on a whiteboard. It began at dinner tables where stories of long walks to school and quiet hunger were passed down like heirlooms — followed by the quiet resolve of elders who'd say, \"Do something, beta. Even small is enough.\"",
    hi: "दोस्ती दिल से किसी व्हाइटबोर्ड पर नहीं बनी। यह उन डाइनिंग टेबल पर शुरू हुई जहाँ स्कूल तक की लंबी यात्राओं और चुपचाप सही गई भूख की कहानियाँ विरासत की तरह सुनाई जातीं — और बड़े-बुज़ुर्ग कहते, \"कुछ कर, बेटा। थोड़ा भी काफ़ी है।\"",
  },
  "about.stand_title_1": { en: "What we", hi: "हम किस बात के लिए" },
  "about.stand_title_em": { en: "stand for.", hi: "खड़े हैं।" },
  "about.stand_p1": {
    en: "We believe showing up is the quiet revolution. A child standing a little taller. A mother's anxious shoulders softening. A classroom that feels seen. Dignity, belonging, a sense of being held — these are the things we try to leave behind.",
    hi: "हम मानते हैं कि वहाँ पहुँचना ही असली चुप क्रांति है। एक बच्चा थोड़ा सीधा खड़ा होता है। एक माँ के कंधे ढीले होते हैं। एक क्लासरूम को लगता है कि उसे देखा गया। आत्मसम्मान, अपनापन, थामे जाने का एहसास — हम यही पीछे छोड़ना चाहते हैं।",
  },
  "about.stand_p2": {
    en: "Dosti Dil Se — friendship from the heart — is how we'd like you to know us. Not as a charity. As a friend who shows up.",
    hi: "दोस्ती दिल से — दिल से बनी दोस्ती — इसी रूप में हम पहचाने जाना चाहते हैं। एक चैरिटी की तरह नहीं। एक दोस्त की तरह जो आता है।",
  },
  "about.v1": { en: "Showing up where learning is hardest.", hi: "जहाँ पढ़ाई सबसे कठिन है, वहाँ पहुँचना।" },
  "about.v2": { en: "Tree drives, clean-ups, green classrooms.", hi: "पौधारोपण, सफ़ाई अभियान, हरे क्लासरूम।" },
  "about.v3": { en: "Whenever we can, wherever we can — no questions asked.", hi: "जब भी हम कर सकें, जहाँ भी हम कर सकें — बिना सवाल।" },
  "about.help_form": { en: "Help in any form", hi: "किसी भी रूप में मदद" },
  "about.seed_title_1": { en: "The seed of kindness", hi: "दया का बीज" },
  "about.seed_title_em": { en: "was planted at home.", hi: "घर पर बोया गया था।" },
  "about.seed_text": {
    en: "This work is not in our hands alone. It is in yours too. Every rupee, every hour, every kind word you send our way becomes part of a child's story. We will carry them with gratitude — and publish every step transparently.",
    hi: "यह काम सिर्फ़ हमारे हाथ में नहीं है। यह आपके हाथ में भी है। हर रुपया, हर घंटा, हर दया भरा शब्द किसी बच्चे की कहानी का हिस्सा बन जाता है। हम इसे कृतज्ञता से सहेजेंगे — और हर कदम पारदर्शी रखेंगे।",
  },
  "about.walk_with_us": { en: "Walk with us", hi: "हमारे साथ चलें" },

  // -------- CONTACT --------
  "contact.kicker": { en: "Get In Touch", hi: "संपर्क में रहें" },
  "contact.title_1": { en: "Say hello.", hi: "नमस्ते कहिए।" },
  "contact.title_em": { en: "We'll say it back.", hi: "हम भी कहेंगे।" },
  "contact.lead": {
    en: "Whether you'd like to volunteer, partner with us, sponsor a school visit, or simply share a kind word — our door is always open.",
    hi: "चाहे आप वॉलंटियर बनना चाहें, साझेदारी करें, किसी स्कूल दौरे को प्रायोजित करें, या बस एक दयालु शब्द भेजें — हमारा दरवाज़ा हमेशा खुला है।",
  },
  "contact.email_us": { en: "Email us", hi: "हमें ईमेल करें" },
  "contact.quote": { en: "\"The smallest message, the quietest offer, can begin a long friendship.\"", hi: "\"सबसे छोटा संदेश, सबसे चुप पेशकश, एक लंबी दोस्ती शुरू कर सकती है।\"" },
  "contact.your_name": { en: "Your name", hi: "आपका नाम" },
  "contact.name_placeholder": { en: "Your name", hi: "आपका नाम" },
  "contact.email": { en: "Email", hi: "ईमेल" },
  "contact.your_message": { en: "Your message", hi: "आपका संदेश" },
  "contact.message_placeholder": { en: "Tell us what's on your heart…", hi: "जो दिल में है, कह दीजिए…" },
  "contact.send": { en: "Send message", hi: "संदेश भेजें" },
  "contact.sending": { en: "Sending…", hi: "भेजा जा रहा है…" },

  // -------- FOOTER --------
  "footer.tagline": {
    en: "A friendship-first foundation working for children, nature, and anyone in need. Transparent, gentle, and built with heart.",
    hi: "दोस्ती को पहले रखने वाला एक फ़ाउंडेशन — बच्चों, प्रकृति और हर ज़रूरतमंद के लिए। पारदर्शी, कोमल, और दिल से बना।",
  },
  "footer.explore": { en: "Explore", hi: "ढूँढिए" },
  "footer.reach_out": { en: "Reach Out", hi: "संपर्क करें" },
  "footer.made_with": { en: "Made with", hi: "दिल से बनाया गया" },
  "footer.in_india": { en: "in India", hi: "भारत में" },
  "footer.rights": { en: "All hearts reserved.", hi: "सर्वाधिकार सुरक्षित।" },

  // -------- COORDINATOR JOIN --------
  "coord.kicker": { en: "Join as Coordinator", hi: "कोऑर्डिनेटर बनें" },
  "coord.title_1": { en: "Lead our work in", hi: "अपने शहर में" },
  "coord.title_em": { en: "your city.", hi: "हमारा काम सम्भालिए।" },
  "coord.lead": {
    en: "Coordinators are the heart of Dosti Dil Se on the ground — the people who show up at schools, sit with parents, and turn intent into action. If you've felt the pull to do more than donate, this is your invitation.",
    hi: "कोऑर्डिनेटर ही ज़मीन पर दोस्ती दिल से का दिल हैं — वो लोग जो स्कूलों में पहुँचते हैं, माता-पिता के पास बैठते हैं और इरादे को काम में बदलते हैं। अगर दान से ज़्यादा करने का मन है, तो यह आपका न्यौता है।",
  },
  "coord.b1_t": { en: "Hyper-local", hi: "हाइपर-लोकल" },
  "coord.b1_d": { en: "Lead in your own city or state", hi: "अपने ही शहर या राज्य में नेतृत्व" },
  "coord.b2_t": { en: "Flexible", hi: "लचीला" },
  "coord.b2_d": { en: "As little as a few hours / month", hi: "महीने में कुछ ही घंटे" },
  "coord.b3_t": { en: "Meaningful", hi: "अर्थपूर्ण" },
  "coord.b3_d": { en: "Direct impact on children", hi: "बच्चों पर सीधा असर" },
  "coord.sec_about": { en: "About you", hi: "आपके बारे में" },
  "coord.sec_about_sub": { en: "Tell us who you are.", hi: "बताइए आप कौन हैं।" },
  "coord.sec_where": { en: "Where you'd like to coordinate", hi: "आप कहाँ काम करना चाहेंगे" },
  "coord.sec_where_sub": { en: "Pick the scope you can hold space for.", hi: "वह दायरा चुनें जिसे आप संभाल सकें।" },
  "coord.sec_story": { en: "Your story", hi: "आपकी कहानी" },
  "coord.sec_story_sub": { en: "The part that matters most. Take your time.", hi: "सबसे ज़रूरी हिस्सा। समय लीजिए।" },
  "coord.full_name": { en: "Full name", hi: "पूरा नाम" },
  "coord.full_name_ph": { en: "Your full name", hi: "आपका पूरा नाम" },
  "coord.email": { en: "Email", hi: "ईमेल" },
  "coord.phone": { en: "Phone", hi: "फ़ोन" },
  "coord.occupation": { en: "Occupation", hi: "व्यवसाय" },
  "coord.occupation_ph": { en: "Student, Engineer, Teacher…", hi: "छात्र, इंजीनियर, शिक्षक…" },
  "coord.age": { en: "Age", hi: "उम्र" },
  "coord.age_ph": { en: "Optional", hi: "वैकल्पिक" },
  "coord.profile_link": { en: "LinkedIn / profile link", hi: "लिंक्डइन / प्रोफ़ाइल लिंक" },
  "coord.photo": { en: "Profile photo (optional)", hi: "प्रोफ़ाइल फ़ोटो (वैकल्पिक)" },
  "coord.photo_help": { en: "JPG/PNG · up to 1.2 MB", hi: "JPG/PNG · 1.2 MB तक" },
  "coord.upload": { en: "Upload", hi: "अपलोड करें" },
  "coord.change": { en: "Change", hi: "बदलें" },
  "coord.remove": { en: "Remove", hi: "हटाएँ" },
  "coord.city": { en: "City", hi: "शहर" },
  "coord.city_ph": { en: "e.g. Pune", hi: "जैसे पुणे" },
  "coord.state": { en: "State", hi: "राज्य" },
  "coord.state_ph": { en: "e.g. Maharashtra", hi: "जैसे महाराष्ट्र" },
  "coord.role": { en: "Role preference", hi: "भूमिका" },
  "coord.role_city": { en: "City Coordinator", hi: "शहर कोऑर्डिनेटर" },
  "coord.role_state": { en: "State Coordinator", hi: "राज्य कोऑर्डिनेटर" },
  "coord.why": { en: "Why do you want to join Dosti Dil Se?", hi: "आप दोस्ती दिल से क्यों जुड़ना चाहते हैं?" },
  "coord.why_ph": { en: "What pulled you here?", hi: "आपको यहाँ क्या ले आया?" },
  "coord.impact": { en: "What impact do you want to make?", hi: "आप क्या असर बनाना चाहेंगे?" },
  "coord.impact_ph": { en: "The change you want to see — for one child, one classroom, one neighbourhood.", hi: "जो बदलाव आप देखना चाहते हैं — एक बच्चे, एक क्लासरूम, एक मोहल्ले के लिए।" },
  "coord.hours": { en: "How many hours / month can you give?", hi: "हर महीने कितने घंटे दे सकते हैं?" },
  "coord.hours_ph": { en: "e.g. 10", hi: "जैसे 10" },
  "coord.referral": { en: "How did you hear about us?", hi: "हमारे बारे में कैसे पता चला?" },
  "coord.referral_ph": { en: "Instagram, friend, search…", hi: "इंस्टाग्राम, दोस्त, सर्च…" },
  "coord.past": { en: "Past volunteering / community experience", hi: "पिछला वॉलंटियर / सामाजिक अनुभव" },
  "coord.past_ph": { en: "Anything you'd like us to know — even a one-time event counts.", hi: "जो भी बताना चाहें — एक बार का इवेंट भी काफ़ी है।" },
  "coord.submit": { en: "Send my application", hi: "मेरा आवेदन भेजें" },
  "coord.submitting": { en: "Sending your application…", hi: "आवेदन भेज रहे हैं…" },
  "coord.terms": { en: "By applying you agree we may contact you about your application. We never share your details.", hi: "आवेदन करने से आप सहमत हैं कि हम आपके आवेदन पर संपर्क कर सकते हैं। हम आपकी जानकारी साझा नहीं करते।" },
  "coord.success_kicker": { en: "Application received", hi: "आवेदन प्राप्त" },
  "coord.success_title": { en: "Thank you,", hi: "धन्यवाद," },
  "coord.success_body": {
    en: "We've received your application and sent a quiet confirmation to your email. Our team reads every word. We'll be in touch within 5–7 days.",
    hi: "हमें आपका आवेदन मिल गया है और हमने आपके ईमेल पर एक शांत पुष्टि भेज दी है। हमारी टीम हर शब्द पढ़ती है। हम 5–7 दिनों में संपर्क करेंगे।",
  },
  "coord.success_quote": { en: "\"Showing up is the first half of changing something.\"", hi: "\"पहुँचना ही बदलाव की पहली शुरुआत है।\"" },
  "coord.back_home": { en: "Back to home", hi: "होम पर वापस" },
  "coord.required_ind": { en: "*", hi: "*" },

  // -------- MUSIC --------
  "music.play": { en: "Play music", hi: "संगीत चलाएँ" },
  "music.pause": { en: "Pause music", hi: "संगीत रोकें" },
};

const LangContext = createContext({ lang: "en", setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("ddls_lang") || "en";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ddls_lang", lang);
      document.documentElement.lang = lang === "hi" ? "hi" : "en";
    }
  }, [lang]);

  const setLang = useCallback((l) => setLangState(l), []);

  const t = useCallback(
    (key) => {
      const entry = dict[key];
      if (!entry) return key;
      return entry[lang] ?? entry.en ?? key;
    },
    [lang],
  );

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useT() {
  return useContext(LangContext);
}
