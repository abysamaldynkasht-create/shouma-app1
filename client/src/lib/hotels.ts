import type { Hotel } from "@shared/schema";
import sixSensesImg from "@/assets/six-senses-hotel.png";
import thousandNightsImg from "@/assets/thousand-nights-camp.png";
import danaBeachImg from "@/assets/dana-beach-resort.png";
import alNebrasImg from "@/assets/al-nebras-hotel.png";
import avaniImg from "@/assets/avani-hotel.png";
import ihyaLodgeImg from "@/assets/ihya-lodge.png";
import ihyaLodgeRoomImg from "@/assets/ihya-lodge-room.png";
import crownePlazaImg from "@/assets/crowne-plaza-duqm.png";
import crownePlazaImg2 from "@/assets/crowne-plaza-duqm-2.png";
import crownePlazaImg3 from "@/assets/crowne-plaza-duqm-3.png";
import alsalamGrandImg from "@/assets/alsalam-grand-resort.png";
import alsalamGrandImg2 from "@/assets/alsalam-grand-resort-2.png";
import sixSensesDeluxeRoomImg from "@/assets/six-senses-deluxe-room.png";
import sixSensesVillaImg from "@/assets/six-senses-villa.png";
import sixSensesYachtImg from "@/assets/six-senses-yacht.png";

export const hotels: Hotel[] = [
  {
    id: "1",
    name: "فندق الحواس الست",
    nameAr: "فندق الحواس الست",
    description: "يعتبر منتجع \"الحواس الست خليج زيغي\" أحد أفخم المنتجعات في الشرق الأوسط. يتميز بتصميمه الذي يشبه القرى العمانية التقليدية مع لمسات من الرفاهية العصرية. يقع بين الجبال الشاهقة وشاطئ رملي خاص ومياه فيروزية. يوفر تجارب فريدة مثل الوصول إلى الفندق عبر الطيران الشراعي، ويضم فللاً خاصة بمسابح مستقلة ومركزاً صحياً (سبا) حائزاً على جوائز عالمية.",
    descriptionEn: "Six Senses Zighy Bay is considered one of the most luxurious resorts in the Middle East. It features a design resembling traditional Omani villages with touches of modern luxury. Located between towering mountains, a private sandy beach, and turquoise waters. It offers unique experiences such as arriving at the hotel via paragliding, and includes private villas with independent pools and an award-winning spa center.",
    descriptionFr: "Le Six Senses Zighy Bay est considéré comme l'un des complexes les plus luxueux du Moyen-Orient. Il présente un design rappelant les villages omanais traditionnels avec des touches de luxe moderne. Situé entre des montagnes imposantes, une plage de sable privée et des eaux turquoise. Il offre des expériences uniques comme l'arrivée à l'hôtel en parapente, et comprend des villas privées avec piscines indépendantes et un centre spa primé.",
    descriptionTr: "Six Senses Zighy Bay, Orta Doğu'nun en lüks tatil köylerinden biri olarak kabul edilir. Geleneksel Umman köylerini andıran bir tasarıma ve modern lüks dokunuşlara sahiptir. Yükselen dağlar, özel kumlu plaj ve turkuaz sular arasında yer alır. Otele yamaç paraşütü ile ulaşım gibi benzersiz deneyimler sunar ve özel havuzlu villalar ile ödüllü bir spa merkezi içerir.",
    city: "ولاية دبا",
    region: "محافظة مسندم",
    image: sixSensesImg,
    gallery: [],
    amenities: ["سبا", "مسبح خاص", "شاطئ خاص", "مطاعم", "واي فاي"],
    rating: 5,
    pricePerNight: 500,
    stars: 5,
    phone: "",
    mapUrl: "https://maps.app.goo.gl/4ASSWXq1DQiQcuds6?g_st=ic",
    roomOptions: [
      {
        id: "r1-deluxe",
        name: "Deluxe Double Sea View Room",
        nameAr: "غرفة ديلوكس مزدوجة مطلة على البحر",
        description: "غرفة فندقية ديلوكس بإطلالة مباشرة على البحر. تحتوي على سرير مزدوج كبير جداً وسرير أريكة. شاملة لجميع الوجبات. الخيار الأنسب للأزواج.",
        pricePerNight: 45,
        maxGuests: 2,
        amenities: ["إطلالة على البحر", "سرير مزدوج", "شامل الوجبات", "واي فاي", "تكييف"],
        image: sixSensesDeluxeRoomImg
      },
      {
        id: "r2-villa",
        name: "6-Bedroom House",
        nameAr: "منزل من 6 غرف نوم",
        description: "بيت عطلات كامل بمساحة 1,000 متر مربع. يحتوي على غرفتي نوم و5 حمّامات. يضم 3 أسرّة (2 مزدوجان كبيران جداً + سرير أريكة). الخيار الأنسب للعائلات والخصوصية.",
        pricePerNight: 239,
        maxGuests: 6,
        amenities: ["مسبح خاص", "خصوصية تامة", "5 حمّامات", "غرفتا نوم", "مطبخ كامل"],
        image: sixSensesVillaImg
      },
      {
        id: "r3-yacht",
        name: "Mobile House - Yacht",
        nameAr: "منزل متنقل - يخت",
        description: "يخت بحري فاخر يحتوي على 4 غرف نوم وغرفة معيشة و3 حمّامات. يضم 9 أسرّة (2 مزدوجان كبيران جداً و7 أسرّة بطابقين). نظام شامل كلياً. الخيار الفاخر والتجربة الفريدة.",
        pricePerNight: 468,
        maxGuests: 9,
        amenities: ["يخت خاص", "شامل كلياً", "4 غرف نوم", "3 حمّامات", "تجربة بحرية فريدة"],
        image: sixSensesYachtImg
      }
    ],
    reviews: [
      { id: "r1", userName: "أحمد محمد", rating: 5, comment: "تجربة لا تُنسى! الخدمة ممتازة والمناظر خلابة. أنصح الجميع بزيارته.", date: "2025-01-15" },
      { id: "r2", userName: "فاطمة علي", rating: 5, comment: "منتجع راقي جداً، الغرف واسعة ونظيفة والطعام لذيذ.", date: "2025-01-10" },
      { id: "r3", userName: "خالد سعيد", rating: 4, comment: "مكان رائع للاسترخاء، السبا ممتاز والموظفون محترفون.", date: "2025-01-05" }
    ]
  },
  {
    id: "2",
    name: "مخيم ألف ليلة",
    nameAr: "مخيم ألف ليلة",
    description: "يُعد مخيم ألف ليلة تجربة بدوية فاخرة في قلب رمال الشرقية. يوفر المخيم إقامة فريدة تجمع بين بساطة الحياة الصحراوية ووسائل الراحة الحديثة، حيث يضم خياماً على الطراز العربي التقليدي (الشيخ) وغرفاً زجاجية تتيح رؤية النجوم. يوفر المخيم أنشطة مثل ركوب الجمال، والتزلج على الرمال، والسباحة في مسبح وسط الكثبان الرملية، بالإضافة إلى عروض موسيقية شعبية في المساء.",
    descriptionEn: "Thousand Nights Camp offers a luxurious Bedouin experience in the heart of the Sharqiyah Sands. The camp provides a unique stay that combines the simplicity of desert life with modern comforts, featuring traditional Arabian-style tents (Sheikh tents) and glass rooms for stargazing. The camp offers activities such as camel riding, sand boarding, and swimming in a pool amid the sand dunes, along with traditional music performances in the evening.",
    descriptionFr: "Le camp Mille et Une Nuits offre une expérience bédouine luxueuse au cœur des sables de Sharqiyah. Le camp propose un séjour unique alliant la simplicité de la vie désertique au confort moderne, avec des tentes de style arabe traditionnel (tentes Sheikh) et des chambres vitrées pour observer les étoiles. Le camp propose des activités telles que les balades à dos de chameau, le surf sur sable et la baignade dans une piscine au milieu des dunes, ainsi que des spectacles de musique traditionnelle le soir.",
    descriptionTr: "Bin Bir Gece Kampı, Sharqiyah Kumları'nın kalbinde lüks bir Bedevi deneyimi sunar. Kamp, çöl yaşamının sadeliğini modern konforla birleştiren benzersiz bir konaklama sağlar; geleneksel Arap tarzı çadırlar (Şeyh çadırları) ve yıldızları izlemek için cam odalar içerir. Kamp, deve binme, kum sörfü ve kumul tepeleri arasında bir havuzda yüzme gibi aktiviteler sunar, akşamları ise geleneksel müzik gösterileri düzenlenir.",
    city: "ولاية بدية",
    region: "محافظة شمال الشرقية",
    image: thousandNightsImg,
    gallery: [],
    amenities: ["ركوب الجمال", "التزلج على الرمال", "مسبح", "عروض موسيقية", "خيام فاخرة"],
    rating: 5,
    pricePerNight: 200,
    stars: 4,
    phone: "",
    mapUrl: "https://maps.app.goo.gl/g624hiFDU7bdyNim6?g_st=ic",
    reviews: [
      { id: "r4", userName: "سارة أحمد", rating: 5, comment: "تجربة الصحراء كانت مذهلة! الليل تحت النجوم شيء لا يوصف.", date: "2025-01-18" },
      { id: "r5", userName: "محمود عبدالله", rating: 5, comment: "ركوب الجمال والتزلج على الرمال كانا ممتعين جداً للأطفال.", date: "2025-01-12" }
    ]
  },
  {
    id: "3",
    name: "منتجع شاطئ الدانة - الأشخرة",
    nameAr: "منتجع شاطئ الدانة - الأشخرة",
    description: "منتجع شاطئ الدانة - الأشخرة هو وجهة هادئة ومميزة تقع على ساحل بحر العرب. يشتهر المكان بالأجواء اللطيفة والمعتدلة خاصة في فصل الصيف، مما يجعله ملاذاً مثالياً للهروب من الحرارة. يتميز المنتجع بإطلالات مباشرة على المحيط، ويوفر غرفاً وشاليهات مريحة تناسب العائلات والأفراد الباحثين عن الاسترخاء بين صوت الأمواج والرمال الناعمة.",
    descriptionEn: "Dana Beach Resort - Ashkharah is a serene and distinctive destination located on the Arabian Sea coast. The place is known for its pleasant and moderate climate, especially in summer, making it an ideal retreat to escape the heat. The resort features direct ocean views and offers comfortable rooms and chalets suitable for families and individuals seeking relaxation amid the sound of waves and soft sands.",
    descriptionFr: "Le Dana Beach Resort - Ashkharah est une destination sereine et distinctive située sur la côte de la mer d'Arabie. L'endroit est réputé pour son climat agréable et modéré, surtout en été, ce qui en fait une retraite idéale pour échapper à la chaleur. Le complexe offre des vues directes sur l'océan et propose des chambres et des chalets confortables adaptés aux familles et aux personnes recherchant la détente au son des vagues et sur le sable fin.",
    descriptionTr: "Dana Beach Resort - Ashkharah, Arap Denizi kıyısında bulunan huzurlu ve özel bir destinasyondur. Mekan, özellikle yaz aylarında hoş ve ılıman iklimiyle tanınır, bu da onu sıcaktan kaçmak için ideal bir sığınak yapar. Tesis, doğrudan okyanus manzarası sunar ve dalgaların sesi ile yumuşak kumlar arasında dinlenme arayan aileler ve bireyler için uygun rahat odalar ve şaleler sağlar.",
    city: "ولاية جعلان بني بو علي",
    region: "محافظة جنوب الشرقية",
    image: danaBeachImg,
    gallery: [],
    amenities: ["شاطئ خاص", "شاليهات", "إطلالة على المحيط", "مناسب للعائلات"],
    rating: 4,
    pricePerNight: 150,
    stars: 4,
    phone: "",
    mapUrl: "https://maps.app.goo.gl/D68DxdxgBKmf1hwJ7?g_st=ic",
    reviews: [
      { id: "r6", userName: "نورة محمد", rating: 4, comment: "شاطئ جميل وهادئ، مثالي للاسترخاء بعيداً عن الزحام.", date: "2025-01-20" }
    ]
  },
  {
    id: "4",
    name: "فندق النبراس",
    nameAr: "فندق النبراس",
    description: "يُعد فندق النبراس من المنشآت الفندقية المريحة والحديثة في المنطقة. يقدم خدمات إقامة متكاملة للزوار والمسافرين، ويتميز بموقعه الذي يسهل الوصول منه إلى الخدمات الأساسية في المدينة، مما يجعله خياراً مناسباً لرجال الأعمال والسياح العابرين للمنطقة.",
    descriptionEn: "Al Nebras Hotel is a comfortable and modern accommodation facility in the region. It offers comprehensive accommodation services for visitors and travelers, distinguished by its convenient location that provides easy access to essential city services, making it a suitable choice for business travelers and tourists passing through the area.",
    descriptionFr: "L'hôtel Al Nebras est un établissement d'hébergement confortable et moderne dans la région. Il offre des services d'hébergement complets pour les visiteurs et les voyageurs, se distinguant par son emplacement pratique qui permet un accès facile aux services essentiels de la ville, ce qui en fait un choix approprié pour les voyageurs d'affaires et les touristes de passage.",
    descriptionTr: "Al Nebras Otel, bölgedeki rahat ve modern konaklama tesislerinden biridir. Ziyaretçiler ve gezginler için kapsamlı konaklama hizmetleri sunar ve şehrin temel hizmetlerine kolay erişim sağlayan elverişli konumuyla öne çıkar, bu da onu iş seyahati yapanlar ve bölgeden geçen turistler için uygun bir seçenek haline getirir.",
    city: "ولاية عبري",
    region: "محافظة الظاهرة",
    image: alNebrasImg,
    gallery: [],
    amenities: ["واي فاي", "موقف سيارات", "خدمة الغرف", "استقبال 24 ساعة"],
    rating: 4,
    pricePerNight: 80,
    stars: 3,
    phone: "",
    mapUrl: "https://maps.app.goo.gl/ivxPyTRSnKJtKCWg9?g_st=ic",
    reviews: [
      { id: "r7", userName: "علي حسن", rating: 4, comment: "فندق نظيف ومريح، الموقع ممتاز والأسعار معقولة.", date: "2025-01-16" }
    ]
  },
  {
    id: "5",
    name: "فندق أفاني مسقط",
    nameAr: "فندق أفاني مسقط",
    description: "يُعد فندق أفاني مسقط من الفنادق العصرية والحديثة التي تجمع بين الراحة والأناقة. يقع في منطقة حيوية وبالقرب من مراكز التسوق الكبرى (مثل سيتي سنتر السيب). يتميز بتصميمه الداخلي الأنيق، ويضم مرافق متنوعة تشمل مسبحاً خارجياً، صالة لياقة بدنية، ومطاعم تقدم أطباقاً عالمية، مما يجعله وجهة مثالية للمسافرين بقصد العمل أو السياحة.",
    descriptionEn: "Avani Muscat Hotel is a contemporary and modern hotel that combines comfort and elegance. Located in a vibrant area near major shopping centers (such as City Centre Seeb), it features stylish interior design and offers diverse facilities including an outdoor pool, fitness center, and restaurants serving international cuisine, making it an ideal destination for business and leisure travelers alike.",
    descriptionFr: "L'hôtel Avani Muscat est un hôtel contemporain et moderne qui allie confort et élégance. Situé dans un quartier animé près des grands centres commerciaux (comme le City Centre Seeb), il présente un design intérieur élégant et offre des installations variées comprenant une piscine extérieure, un centre de fitness et des restaurants servant une cuisine internationale, ce qui en fait une destination idéale pour les voyageurs d'affaires et de loisirs.",
    descriptionTr: "Avani Muscat Hotel, konfor ve zarafeti bir araya getiren çağdaş ve modern bir oteldir. Büyük alışveriş merkezlerine yakın (City Centre Seeb gibi) canlı bir bölgede yer alır. Şık iç tasarımı ile dikkat çeker ve açık havuz, fitness merkezi ve uluslararası mutfak sunan restoranlar dahil çeşitli tesisler sunar, bu da onu hem iş hem de tatil amaçlı seyahat edenler için ideal bir destinasyon haline getirir.",
    city: "ولاية السيب",
    region: "محافظة مسقط",
    image: avaniImg,
    gallery: [],
    amenities: ["مسبح خارجي", "صالة لياقة", "مطاعم عالمية", "واي فاي", "قريب من مراكز التسوق"],
    rating: 4,
    pricePerNight: 120,
    stars: 4,
    phone: "",
    mapUrl: "https://maps.app.goo.gl/ijURp6fbdT9HgDVe7?g_st=ic",
    reviews: [
      { id: "r8", userName: "ريم سالم", rating: 4, comment: "فندق عصري وأنيق، قريب من مراكز التسوق.", date: "2025-01-14" },
      { id: "r9", userName: "يوسف ناصر", rating: 4, comment: "المسبح رائع والإفطار متنوع ولذيذ.", date: "2025-01-08" }
    ]
  },
  {
    id: "6",
    name: "نزل إحياء",
    nameAr: "نزل إحياء",
    description: "يُعد \"نُزل إحياء\" تجربة سياحية تراثية فريدة، حيث تم ترميم وتحويل بيوت قديمة في حارة أثرية إلى نزل فندقي يجمع بين عبق الماضي ورفاهية الحاضر. يتميز المكان بتصميمه المعماري العماني التقليدي باستخدام الطين والأخشاب، ويمنح الزوار فرصة للعيش في قلب التاريخ العماني مع الاستمتاع بإطلالات خلابة على المزارع والجبال المحيطة.",
    descriptionEn: "Ihya Lodge offers a unique heritage tourism experience, where old houses in a historic neighborhood have been restored and transformed into a boutique lodge that combines the charm of the past with the comfort of the present. The place features traditional Omani architectural design using mud and wood, and offers visitors the opportunity to live in the heart of Omani history while enjoying breathtaking views of the surrounding farms and mountains.",
    descriptionFr: "Le Ihya Lodge offre une expérience touristique patrimoniale unique, où d'anciennes maisons d'un quartier historique ont été restaurées et transformées en un lodge boutique alliant le charme du passé au confort du présent. L'endroit présente un design architectural omanais traditionnel utilisant la terre et le bois, et offre aux visiteurs l'opportunité de vivre au cœur de l'histoire omanaise tout en profitant de vues imprenables sur les fermes et les montagnes environnantes.",
    descriptionTr: "Ihya Lodge, tarihi bir mahalledeki eski evlerin restore edilerek geçmişin cazibesini bugünün konforu ile birleştiren butik bir konuklığa dönüştürüldüğü benzersiz bir miras turizmi deneyimi sunar. Mekan, çamur ve ahşap kullanılarak geleneksel Umman mimari tasarımına sahiptir ve ziyaretçilere çevredeki çiftliklerin ve dağların nefes kesici manzaralarının tadını çıkarırken Umman tarihinin kalbinde yaşama fırsatı sunar.",
    city: "ولاية نزوى",
    region: "محافظة الداخلية",
    image: ihyaLodgeImg,
    gallery: [ihyaLodgeRoomImg],
    amenities: ["تراث عماني", "إطلالات جبلية", "تصميم تقليدي", "بيئة هادئة"],
    rating: 5,
    pricePerNight: 100,
    stars: 4,
    phone: "",
    mapUrl: "https://maps.app.goo.gl/YjoDQXuPkBVfctkM9?g_st=ic",
    reviews: [
      { id: "r10", userName: "مريم خالد", rating: 5, comment: "تجربة تراثية رائعة! العيش في بيت عماني تقليدي كان مميزاً جداً.", date: "2025-01-19" },
      { id: "r11", userName: "عبدالرحمن سليم", rating: 5, comment: "المكان ساحر والإطلالات خلابة على الجبال والمزارع.", date: "2025-01-11" }
    ]
  },
  {
    id: "7",
    name: "فندق كراون بلازا الدقم",
    nameAr: "فندق كراون بلازا الدقم",
    description: "يُعد فندق كراون بلازا الدقم فندقاً أنيقاً يقع مباشرة على الشاطئ، ويجمع بين الرفاهية والراحة. يضم الفندق 4 خيارات متنوعة لتناول الطعام، بالإضافة إلى مركز للياقة البدنية ومسابح داخلية وخارجية. صُمم الفندق ليلبي احتياجات المسافرين من أجل العمل بفضل موقعه القريب من المنطقة الاقتصادية بالدقم، كما يوفر أجواءً مثالية للاسترخاء والتمتع بجمال الساحل للباحثين عن الاستجمام.",
    descriptionEn: "Crowne Plaza Duqm is an elegant hotel located directly on the beach, combining luxury and comfort. The hotel features 4 diverse dining options, along with a fitness center and indoor and outdoor pools. Designed to meet the needs of business travelers thanks to its proximity to the Duqm Economic Zone, it also provides an ideal atmosphere for relaxation and enjoying the coastal beauty for those seeking leisure.",
    descriptionFr: "Le Crowne Plaza Duqm est un hôtel élégant situé directement sur la plage, alliant luxe et confort. L'hôtel propose 4 options de restauration variées, ainsi qu'un centre de fitness et des piscines intérieures et extérieures. Conçu pour répondre aux besoins des voyageurs d'affaires grâce à sa proximité avec la zone économique de Duqm, il offre également une atmosphère idéale pour la détente et la contemplation de la beauté côtière pour ceux qui recherchent le repos.",
    descriptionTr: "Crowne Plaza Duqm, doğrudan sahilde yer alan lüks ve konforu bir araya getiren zarif bir oteldir. Otel, 4 farklı yemek seçeneği, fitness merkezi ve kapalı-açık havuzlar sunar. Duqm Ekonomik Bölgesi'ne yakınlığı sayesinde iş seyahati yapanların ihtiyaçlarını karşılamak üzere tasarlanmıştır ve aynı zamanda dinlenme arayanlar için kıyı güzelliğinin tadını çıkarmak için ideal bir atmosfer sağlar.",
    city: "ولاية الدقم",
    region: "محافظة الوسطى",
    image: crownePlazaImg,
    gallery: [crownePlazaImg2, crownePlazaImg3],
    amenities: ["شاطئ خاص", "مسبح داخلي وخارجي", "صالة لياقة", "4 مطاعم", "واي فاي"],
    rating: 5,
    pricePerNight: 180,
    stars: 5,
    phone: "",
    mapUrl: "https://maps.app.goo.gl/DsKGZKDxVh9jkPc58?g_st=ic",
    reviews: [
      { id: "r12", userName: "هدى علي", rating: 5, comment: "فندق فخم جداً، الخدمة ممتازة والموقع على الشاطئ مباشرة.", date: "2025-01-17" },
      { id: "r13", userName: "أسامة محمد", rating: 5, comment: "المطاعم متنوعة والمسبح رائع، أنصح به لرحلات العمل والاستجمام.", date: "2025-01-09" }
    ]
  },
  {
    id: "8",
    name: "منتجع السلام جراند",
    nameAr: "منتجع السلام جراند",
    description: "يعتبر منتجع السلام جراند من المنتجعات الفاخرة والمميزة في منطقة البريمي. يوفر المنتجع إقامة مريحة في غرف وأجنحة واسعة ومجهزة بأحدث المرافق. يضم المنتجع مرافق ترفيهية متنوعة تشمل مسبحاً خارجياً كبيراً، وصالة رياضية، ومنطقة ألعاب للأطفال، بالإضافة إلى مطعم يقدم تشكيلة من المأكولات العالمية والمحلية، مما يجعله وجهة مثالية للعائلات والمسافرين الباحثين عن الهدوء والخصوصية.",
    descriptionEn: "Al Salam Grand Resort is one of the luxurious and distinguished resorts in the Buraimi area. The resort offers comfortable accommodation in spacious rooms and suites equipped with the latest facilities. It features diverse recreational amenities including a large outdoor pool, gym, and children's play area, along with a restaurant serving a variety of international and local cuisine, making it an ideal destination for families and travelers seeking tranquility and privacy.",
    descriptionFr: "Le Al Salam Grand Resort est l'un des complexes luxueux et distingués de la région de Buraimi. Le complexe offre un hébergement confortable dans des chambres et suites spacieuses équipées des dernières installations. Il dispose d'équipements de loisirs variés comprenant une grande piscine extérieure, une salle de sport et une aire de jeux pour enfants, ainsi qu'un restaurant servant une variété de cuisines internationales et locales, ce qui en fait une destination idéale pour les familles et les voyageurs recherchant tranquillité et intimité.",
    descriptionTr: "Al Salam Grand Resort, Buraimi bölgesindeki lüks ve seçkin tatil köylerinden biridir. Tesis, en son olanaklarla donatılmış geniş odalarda ve süitlerde konforlu konaklama sunar. Büyük açık havuz, spor salonu ve çocuk oyun alanı gibi çeşitli eğlence tesisleri ile uluslararası ve yerel mutfaktan çeşitli yemekler sunan bir restoran içerir, bu da onu huzur ve mahremiyet arayan aileler ve gezginler için ideal bir destinasyon haline getirir.",
    city: "ولاية البريمي",
    region: "محافظة البريمي",
    image: alsalamGrandImg,
    gallery: [alsalamGrandImg2],
    amenities: ["مسبح خارجي", "صالة رياضية", "منطقة ألعاب أطفال", "مطعم", "واي فاي"],
    rating: 4,
    pricePerNight: 120,
    stars: 4,
    phone: "",
    mapUrl: "https://maps.app.goo.gl/Ds2Cnbf94pAr1Atz6",
    reviews: []
  }
];
