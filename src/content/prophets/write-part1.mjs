import { appendFileSync } from 'fs';
const file = 'D:\\Projek\\blog\\blog-app\\src\\content\\prophets\\chapter-07-ibrahim.md';

const parts = [];

parts.push(`

## Latar Belakang: Kaum & Zaman

### Peradaban Sumeria di Ur

Ibrahim lahir di Ur Ka'ldi, salah satu kota terbesar dan termakmur di peradaban Sumeria — peradaban tertua di dunia yang tercatat dalam sejarah. Ur terletak di tepi Sungai Eufrat, di dataran subur Mesopotamia (sekarang wilayah Irak selatan). Pada masa Ibrahim, Ur adalah pusat perdagangan internasional, kota pelabuhan yang ramai, dan pusat kebudayaan yang mengagumkan.

Kota Ur memiliki arsitektur yang luar biasa: ziggurat raksasa (menara piramida bertingkat) yang didedikasikan untuk dewa bulan Nanna (Sin), istana-istana megah, jaringan irigasi yang canggih, dan sistem perdagangan yang menghubungkan Ur dengan Dilmun (Bahrain), Magan (Oman), dan kota-kota di Lembah Indus. Penduduk Ur diperkirakan mencapai ratusan ribu jiwa — sebuah angka yang luar biasa untuk standar zaman itu.

Namun, kemakmuran material Ur dibangun di atas fondasi spiritual yang rusak total. Sumeria adalah peradaban politeistik. Mereka memiliki panteon dewa yang sangat kompleks: Anu (dewa langit), Enlil (dewa angin), Enki (dewa air), Nanna/Sin (dewa bulan — dewa pelindung Ur), Utu (dewa matahari), Inanna (dewa cinta dan perang), dan puluhan dewa lainnya. Mereka membangun ziggurat yang megah untuk menyembah dewa-dewa ini, membuat patung-patung dari emas, perak, dan batu, serta mengorbankan hewan dan bahkan manusia untuk memperoleh ridha dewa-dewa mereka.

### Tradisi Penyembahan Berhala

Penyembahan berhala di Ur dan seluruh Mesopotamia bukan sekadar ritual keagamaan — ia adalah inti dari seluruh sistem sosial, politik, dan ekonomi. Raja dianggap sebagai wakil dewa di bumi. Kuil-kuil adalah pusat ekonomi yang menguasai lahan pertanian, perdagangan, dan perbendaharaan negara. Para imam (pendeta) memiliki kekuasaan yang setara dengan pejabat negara. Membangun berhala atau ziggurat baru adalah proyek nasional yang memakan sumber daya seluruh peradaban.

Berhala-berhala yang mereka sembah terbuat dari berbagai material: kayu, batu, tanah liat, emas, dan perak. Mereka percaya bahwa dewa-dewa ini memiliki kekuatan gaib yang dapat memberkahi panen, menurunkan hujan, melindungi dari musuh, dan menjamin keberhasilan perdagangan. Setiap rumah tangga memiliki miniatur berhala, setiap kota memiliki kuil utama, dan setiap kegiatan — dari menanam benih hingga berperang — dimulai dengan ritual untuk dewa-dewa tertentu.

### Keadaan Spiritual Ibrahim

Dalam lingkungan seperti ini — di mana seluruh peradaban menyembah berhala, di mana imam-imam mengajarkan politeisme sebagai kebenaran mutlak, di mana raja dan rakyat sepakat bahwa dewa-dewa buatan tangan manusia layak disembah — Ibrahim tumbuh menjadi seorang pemuda yang mempertanyakan segalanya.

Ibrahim tidak menerima begitu saja ajaran leluhurnya. Ia menggunakan akal yang diberikan Allah untuk mengamati alam semesta, merenungi penciptaan langit dan bumi, dan mencari kebenaran yang hakiki. Kisah pencariannya akan Tuhan yang sejati adalah salah satu narasi paling mengharukan dalam sejarah manusia — sebuah perjalanan intelektual dan spiritual yang dimulai dari keraguan dan berakhir pada keyakinan mutlak.

### Tarikh Nabi Ibrahim

Menurut Tafsir Ibn Kathir dan catatan sejarawan Muslim, Ibrahim dilahirkan sekitar 1800 SM. Ayahnya, Tarakh (Azar/Terah dalam tradisi Ibrani), adalah seorang pembuat berhala sekaligus penghormat utama di kuil Nanna. Kakek buyut Ibrahim, Sam bin Nuh, masih hidup pada masa Ibrahim dan merupakan leluhur spiritual yang menghubungkan Ibrahim dengan tradisi kenabian Nuh. Sam bin Nuh dipercaya mengajarkan tauhid kepada keturunannya, namun ajaran ini perlahan-lahan terkikis oleh pengaruh budaya politeistik Mesopotamia.

Ibrahim hidup pada masa yang berbeda dari Nuh, Idris, dan Hud — para nabi sebelumnya. Ia hidup di era di mana peradaban manusia sudah berkembang pesat secara material, namun justru semakin jauh dari kebenaran spiritual. Tugasnya adalah membangun kembali fondasi tauhid dari nol, di tengah masyarakat yang sudah terlanjur tenggelam dalam politeisme selama berabad-abad.
`);

appendFileSync(file, parts.join(''), 'utf8');
console.log('Done part Latar Belakang');
