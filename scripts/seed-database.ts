// scripts/seed-database.ts
import { neon } from "@neondatabase/serverless"
import * as dotenv from "dotenv"
import { randomBytes } from "crypto"

// Load environment variables
dotenv.config({ path: ".env.local" })

// Generate unique IDs for users (simulating Google OAuth IDs)
function generateId(): string {
  return randomBytes(16).toString('hex')
}

// Sample data
const sampleUsers = [
  {
    id: generateId(),
    email: "abba.yohannes@church.et",
    name: "Abba Yohannes Tesfaye",
    displayName: "Abba Yohannes",
    image: null,
    photoURL: null,
    isAdmin: true
  },
  {
    id: generateId(),
    email: "deacon.michael@tewahedo.org",
    name: "Deacon Michael Bekele",
    displayName: "Deacon Michael",
    image: null,
    photoURL: null,
    isAdmin: true
  },
  {
    id: generateId(),
    email: "sara.abraham@email.com",
    name: "Sara Abraham",
    displayName: "Sara Abraham",
    image: null,
    photoURL: null,
    isAdmin: false
  },
  {
    id: generateId(),
    email: "dawit.mekonnen@email.com",
    name: "Dawit Mekonnen",
    displayName: "Dawit M.",
    image: null,
    photoURL: null,
    isAdmin: false
  },
  {
    id: generateId(),
    email: "helen.tadesse@email.com",
    name: "Helen Tadesse",
    displayName: "Helen T.",
    image: null,
    photoURL: null,
    isAdmin: false
  },
  {
    id: generateId(),
    email: "abraham.wolde@email.com",
    name: "Abraham Wolde",
    displayName: "Abraham W.",
    image: null,
    photoURL: null,
    isAdmin: false
  }
]

const sampleQuestions = [
  {
    title: "What is the significance of the Holy Trinity in Ethiopian Orthodox theology?",
    content: `<p>I'm trying to understand how the <strong>Ethiopian Orthodox Tewahedo Church</strong> explains the concept of the Holy Trinity.</p>
    
<p>Specifically, I'm looking for guidance on:</p>
<ul>
<li>How does our understanding differ from other Orthodox churches?</li>
<li>What are the key theological principles that guide our interpretation?</li>
<li>How do we experience the Trinity in our daily spiritual life?</li>
</ul>

<p>Any references to our church fathers or traditional teachings would be greatly appreciated.</p>`,
    category: "Theology",
    authorIndex: 2 // Sara Abraham
  },
  {
    title: "When should I start fasting before Timkat (Epiphany)?",
    content: `<p>I want to properly prepare for <strong>Timkat celebration</strong> this year and need guidance on the fasting requirements.</p>

<p>My questions are:</p>
<ul>
<li>When exactly does the preparation period begin?</li>
<li>Are there different rules for adults vs children?</li>
<li>What specific foods should be avoided?</li>
<li>Are there any exceptions for health conditions?</li>
</ul>

<p>I've heard different things from different people, so I'm hoping for <em>authoritative guidance</em> from our church tradition.</p>`,
    category: "Practices",
    authorIndex: 3 // Dawit Mekonnen
  },
  {
    title: "What are the 81 books of the Ethiopian Orthodox Bible?",
    content: `<p>I know our Bible has more books than the Protestant Bible, and I want to understand our complete canon.</p>

<p>Could someone please provide:</p>
<ol>
<li>A complete list of all 81 books</li>
<li>Which books are unique to our tradition</li>
<li>Why certain books like <strong>Enoch</strong> and <strong>Jubilees</strong> are included in our canon</li>
<li>The historical basis for our broader biblical canon</li>
</ol>

<p>I'm particularly interested in understanding the <em>theological significance</em> of having these additional books.</p>`,
    category: "Faith",
    authorIndex: 4 // Helen Tadesse
  },
  {
    title: "History of the Ark of the Covenant in Ethiopia - authentic sources?",
    content: `<p>I've heard many stories about the <strong>Ark of the Covenant</strong> being in Ethiopia, specifically in Axum.</p>

<p>I'm researching this topic and would like to know:</p>
<ul>
<li>What are the most reliable historical sources about this claim?</li>
<li>How do we separate <em>tradition</em> from <em>historical fact</em>?</li>
<li>What does the <strong>Kebra Nagast</strong> actually say about this?</li>
<li>Are there archaeological evidences supporting our tradition?</li>
</ul>

<blockquote>I want to approach this topic with both faith and scholarly rigor.</blockquote>`,
    category: "History",
    authorIndex: 5 // Abraham Wolde
  },
  {
    title: "Proper way to receive Holy Communion during Divine Liturgy?",
    content: `<p>As a new convert to the Ethiopian Orthodox Church, I want to make sure I'm approaching <strong>Holy Communion</strong> correctly.</p>

<p>I need guidance on:</p>
<ol>
<li>What is the proper preparation beforehand?</li>
<li>What should I do during the receiving of the <em>Eucharist</em>?</li>
<li>What prayers or actions should I take after communion?</li>
<li>Are there any common mistakes I should avoid?</li>
</ol>

<p>I want to approach this most sacred sacrament with the proper reverence and understanding.</p>`,
    category: "Practices",
    authorIndex: 2 // Sara Abraham
  },
  {
    title: "Understanding the Ge'ez language in our liturgy",
    content: `<p>I attend our church regularly but struggle with understanding the <strong>Ge'ez language</strong> used in our services.</p>

<p>My questions are:</p>
<ul>
<li>Why is Ge'ez still used in our church services?</li>
<li>Is it important for lay people to learn Ge'ez?</li>
<li>Is following along in translation sufficient for spiritual growth?</li>
<li>What are some basic Ge'ez prayers every Orthodox Christian should know?</li>
</ul>

<p><em>I want to deepen my participation in the liturgy</em> but I'm not sure where to start with the language barrier.</p>`,
    category: "General",
    authorIndex: 3 // Dawit Mekonnen
  },
  {
    title: "Monophysite vs. Miaphysite - clarifying our Christology",
    content: `<p>I often see our church labeled as <strong>"Monophysite"</strong> but I've also heard we're <strong>"Miaphysite."</strong></p>

<p>Can someone please explain:</p>
<ol>
<li>What is the difference between these two terms?</li>
<li>Which one correctly describes our church's teaching?</li>
<li>Why does this distinction matter for our faith?</li>
<li>How does our Christology differ from Chalcedonian churches?</li>
</ol>

<p>This seems to be an important theological distinction that I don't fully understand.</p>`,
    category: "Theology",
    authorIndex: 4 // Helen Tadesse
  },
  {
    title: "Saint Yared and the development of Ethiopian church music",
    content: `<p>I'm researching the history of our liturgical music and want to learn more about <strong>Saint Yared's</strong> contributions.</p>

<p>What I'd like to understand:</p>
<ul>
<li>What do we know historically about Saint Yared?</li>
<li>How did he develop our unique musical tradition?</li>
<li>What are the <em>three modes</em> of Ethiopian church music?</li>
<li>How does our music differ from other Orthodox traditions?</li>
</ul>

<blockquote>I'm particularly interested in how our music enhances the spiritual experience of worship.</blockquote>`,
    category: "History",
    authorIndex: 5 // Abraham Wolde
  },
  {
    title: "Wedding ceremony traditions and their meanings",
    content: `<p>My wedding is coming up and I want to understand the deeper meaning behind our traditional <strong>Ethiopian Orthodox wedding ceremonies</strong>.</p>

<p>Could someone explain the significance of:</p>
<ul>
<li>The <strong>crowns</strong> placed on the couple</li>
<li>The traditional <em>wedding dance</em></li>
<li>The specific prayers and blessings used</li>
<li>The role of the priest and community</li>
</ul>

<p>I want our wedding to be meaningful and rooted in our faith tradition, not just ceremonial.</p>`,
    category: "Practices",
    authorIndex: 2 // Sara Abraham
  },
  {
    title: "The role of angels in Ethiopian Orthodox spirituality",
    content: `<p>Our church seems to have a rich tradition regarding <strong>angels</strong> and their role in our spiritual life.</p>

<p>I'd like to understand:</p>
<ol>
<li>What is the role of angels in our theology?</li>
<li>How do angels function in our daily spiritual practice?</li>
<li>What does the <em>Book of Enoch</em> teach us about angels?</li>
<li>How should we pray to or with angels?</li>
</ol>

<p>Sometimes I feel like this aspect of our faith is not well explained, but it seems very important to our tradition.</p>`,
    category: "Faith",
    authorIndex: 3 // Dawit Mekonnen
  }
]

const sampleAnswers = [
  // Answers for Trinity question
  {
    content: `<p>The Ethiopian Orthodox understanding of the <strong>Holy Trinity</strong> is deeply rooted in the Council of Nicaea, but we maintain our unique theological emphasis.</p>

<p>We believe in <em>one God in three persons</em> - Father, Son, and Holy Spirit - who are <strong>consubstantial</strong> (of the same essence). What distinguishes our understanding is our emphasis on:</p>

<ul>
<li>The <strong>unity of essence</strong> while maintaining the distinction of persons</li>
<li>The Trinity as a <em>lived reality</em> in our spiritual life, not just theological concept</li>
<li>The presence of the Trinity in our liturgy, prayers, and understanding of salvation</li>
</ul>

<p>Our church fathers like <strong>Abba Salama</strong> have written extensively on this, emphasizing that the Trinity is present in every aspect of our faith journey.</p>

<blockquote>
<p>"The Trinity is not merely a doctrine to be understood, but a divine reality to be experienced in our daily walk with God."</p>
</blockquote>`,
    questionIndex: 0,
    authorIndex: 0 // Abba Yohannes
  },
  {
    content: `<p>To add to the theological explanation, practically speaking, we see the Trinity reflected in our worship:</p>

<ul>
<li><strong>Sign of the Cross:</strong> We invoke the Trinity with every blessing</li>
<li><strong>Liturgical Prayers:</strong> Constantly reference the three persons</li>
<li><strong>Anaphora Prayers:</strong> During Holy Communion, we specifically invoke each person of the Trinity in their unique roles in our salvation</li>
</ul>

<p>The <em>Divine Liturgy</em> is essentially a Trinitarian prayer where we encounter God as Father, Son, and Holy Spirit simultaneously.</p>`,
    questionIndex: 0,
    authorIndex: 1 // Deacon Michael
  },
  // Answers for Timkat fasting
  {
    content: `<p>The preparation for <strong>Timkat</strong> is a beautiful spiritual journey that typically begins with a <strong>three-day fast</strong> before the celebration. However, many faithful choose to fast for the entire week preceding Timkat.</p>

<h3>Fasting Requirements Include:</h3>
<ul>
<li><strong>Dietary:</strong> Abstaining from animal products (meat, dairy, eggs)</li>
<li><strong>Spiritual:</strong> Increased prayer and scripture reading</li>
<li><strong>Preparation:</strong> Confession and meditation on Christ's baptism</li>
</ul>

<h3>Age Guidelines:</h3>
<ul>
<li><strong>Children under 7:</strong> Generally not required to fast</li>
<li><strong>Older children:</strong> May participate according to their ability and with parental guidance</li>
<li><strong>Adults:</strong> Full participation in fasting and spiritual preparation</li>
</ul>

<p><em>Remember:</em> The most important aspect is the <strong>spiritual preparation</strong> - confession, prayer, and meditation on Christ's baptism in the Jordan River.</p>

<blockquote>
<p>The fast purifies not just our body, but prepares our soul to receive the blessings of this holy celebration.</p>
</blockquote>`,
    questionIndex: 1,
    authorIndex: 1 // Deacon Michael
  },
  // Answers for 81 books question
  {
    content: `<p>The Ethiopian Orthodox Tewahedo Church recognizes <strong>81 books</strong> in our Bible - <strong>46 in the Old Testament</strong> and <strong>35 in the New Testament</strong>.</p>

<h3>Key Additional Books Include:</h3>
<ul>
<li><strong>1 Enoch</strong> - Provides deep theological insights into angels, judgment, and the Messiah</li>
<li><strong>Jubilees</strong> - Offers detailed chronology and interpretation of biblical events</li>
<li><strong>1 Esdras</strong> - Historical and prophetic content</li>
<li><strong>Prayer of Manasseh</strong> - Penitential prayer</li>
<li><strong>3 and 4 Maccabees</strong> - Historical accounts of Jewish resistance</li>
</ul>

<p>These books were <em>preserved in Ge'ez translation</em> and have been part of our tradition since ancient times. For example, the <strong>Book of Enoch</strong> is quoted in the New Testament (Jude 1:14-15), supporting its authenticity in our view.</p>

<blockquote>
<p>Our broader canon reflects the church's role as a guardian of ancient Christian texts that were lost elsewhere. We are custodians of the complete biblical tradition.</p>
</blockquote>

<p>These aren't "extra" books but <strong>integral parts of our faith tradition</strong> that have shaped Ethiopian Christian thought for centuries.</p>`,
    questionIndex: 2,
    authorIndex: 0 // Abba Yohannes
  },
  {
    content: `<p>I'd like to add that these additional books provide <strong>valuable spiritual and historical insights</strong>:</p>

<h3>Spiritual Value:</h3>
<ul>
<li><strong>Book of Jubilees:</strong> Detailed chronology of biblical events and deeper understanding of God's covenant</li>
<li><strong>1 Enoch:</strong> Profound theological understanding of angels, judgment, and the coming Messiah</li>
<li><strong>Maccabees:</strong> Examples of faithful resistance and martyrdom</li>
</ul>

<p>These texts have <em>shaped Ethiopian Christian thought for centuries</em> and continue to inform our theology and spiritual practice today.</p>`,
    questionIndex: 2,
    authorIndex: 1 // Deacon Michael
  },
  // Answer for Ark of Covenant
  {
    content: `<p>The question of the <strong>Ark of the Covenant</strong> in Ethiopia is complex and requires careful consideration of both tradition and historical evidence.</p>

<h3>Our Tradition (Kebra Nagast):</h3>
<p>Our tradition, recorded in the <strong>Kebra Nagast</strong> (Glory of the Kings), tells of:</p>
<ul>
<li>Queen of Sheba's visit to King Solomon</li>
<li>The subsequent arrival of the Ark in Ethiopia</li>
<li>Its safekeeping in Axum for over 3,000 years</li>
</ul>

<h3>Supporting Factors:</h3>
<ul>
<li><strong>Beta Israel:</strong> The ancient Jewish community in Ethiopia</li>
<li><strong>Architecture:</strong> Similarities between Ethiopian churches and Solomon's temple</li>
<li><strong>Continuous Tradition:</strong> Unbroken tradition maintained in Axum</li>
</ul>

<p><em>However</em>, we must distinguish between <strong>faith tradition</strong> and <strong>historical proof</strong>. While archaeological evidence is limited, our faith tradition has been consistently maintained.</p>

<blockquote>
<p>What's most important is that our faith doesn't depend on possessing the physical Ark, but on God's presence among us through Christ and the Holy Spirit.</p>
</blockquote>

<p>The Ark represents God's covenant with His people, and that covenant is now fulfilled in Christ Jesus.</p>`,
    questionIndex: 3,
    authorIndex: 0 // Abba Yohannes
  },
  // Answer for Holy Communion
  {
    content: `<p>Proper preparation for <strong>Holy Communion</strong> is essential for receiving this sacred sacrament worthily.</p>

<h3>Preparation Requirements:</h3>
<ol>
<li><strong>Fasting:</strong> From food and drink from midnight (or at least 3 hours before)</li>
<li><strong>Confession:</strong> Confession of sins to a priest</li>
<li><strong>Prayer:</strong> Spiritual preparation through prayer and meditation</li>
<li><strong>State of Grace:</strong> Being free from unconfessed mortal sins</li>
</ol>

<h3>During Communion:</h3>
<ul>
<li>Approach with <strong>humility and reverence</strong></li>
<li>Receive the Body and Blood reverently</li>
<li><strong>Do not chew</strong> the Eucharist - let it dissolve</li>
<li>Maintain a spirit of prayer and worship</li>
</ul>

<h3>After Communion:</h3>
<ul>
<li>Spend time in <strong>thanksgiving prayer</strong></li>
<li>Reflect on the mystery you have received</li>
<li>Maintain the spirit of communion throughout the day</li>
</ul>

<p><strong>Important Note:</strong> Holy Communion is only for <em>baptized Orthodox Christians</em> who are properly prepared. This is not exclusion but protection - receiving unworthily can be spiritually harmful.</p>

<blockquote>
<p>"Whoever eats the bread or drinks the cup of the Lord unworthily will be guilty of sinning against the body and blood of the Lord." - 1 Corinthians 11:27</p>
</blockquote>`,
    questionIndex: 4,
    authorIndex: 1 // Deacon Michael
  },
  // Answer for Ge'ez language
  {
    content: `<p><strong>Ge'ez</strong> is our sacred language, much like Latin in the Roman Catholic Church or Hebrew in Judaism. It serves several important purposes in our faith:</p>

<h3>Why Ge'ez Remains Important:</h3>
<ul>
<li><strong>Ancient Heritage:</strong> Connects us to our roots and ancient Christian tradition</li>
<li><strong>Liturgical Purity:</strong> Maintains the purity of our liturgical tradition</li>
<li><strong>Spiritual Value:</strong> Certain prayers and concepts lose meaning in translation</li>
<li><strong>Unity:</strong> Unifies Ethiopian Orthodox believers worldwide</li>
</ul>

<h3>For Lay People:</h3>
<p>While I <em>encourage learning basic Ge'ez prayers</em>, following along in translation is perfectly acceptable for spiritual growth. What matters most is:</p>

<ul>
<li><strong>Heart Participation:</strong> Engaging with your whole being</li>
<li><strong>Understanding:</strong> Grasping the meaning through translation</li>
<li><strong>Devotion:</strong> Maintaining a spirit of worship</li>
</ul>

<blockquote>
<p>The most important thing is participating with your heart, regardless of language comprehension. God hears the prayers of the heart, not just the mind.</p>
</blockquote>

<p><em>Consider starting with:</em> Learning the Lord's Prayer, Hail Mary, and basic liturgical responses in Ge'ez while using translations for deeper understanding.</p>`,
    questionIndex: 5,
    authorIndex: 0 // Abba Yohannes
  },
  // Answer for Christology
  {
    content: `<p><strong>This is a crucial distinction!</strong> We are <em>NOT</em> Monophysites - that's a historical misunderstanding that has persisted for centuries.</p>

<h3>The Clear Distinction:</h3>

<table>
<tr>
<th>Monophysitism (REJECTED)</th>
<th>Miaphysitism (OUR BELIEF)</th>
</tr>
<tr>
<td>Christ has only <strong>one nature</strong> (divine only)</td>
<td>Christ has <strong>one united nature</strong> that is both fully divine and fully human</td>
</tr>
<tr>
<td>Denies Christ's humanity</td>
<td>Affirms both Christ's divinity and humanity</td>
</tr>
<tr>
<td>Heretical position</td>
<td>Orthodox Christology</td>
</tr>
</table>

<h3>Our Miaphysite Teaching:</h3>
<p>We follow <strong>St. Cyril of Alexandria's</strong> formulation: <em>"one nature of the incarnate Word of God"</em> (μία φύσις τοῦ θεοῦ λόγου σεσαρκωμένη).</p>

<p>This united nature:</p>
<ul>
<li><strong>Does NOT confuse</strong> Christ's divinity and humanity</li>
<li><strong>Does NOT separate</strong> them into two persons</li>
<li><strong>Maintains perfect unity</strong> without mixture or confusion</li>
</ul>

<blockquote>
<p>Christ is fully God and fully man, united in one person without confusion, change, division, or separation.</p>
</blockquote>

<p><strong>Why This Matters:</strong> This distinction correctly represents our orthodox Christology and distinguishes us from both heretical Monophysitism and the Chalcedonian formulation that we believe creates unnecessary division.</p>`,
    questionIndex: 6,
    authorIndex: 0 // Abba Yohannes
  },
  // Answer for Saint Yared
  {
    content: `<p><strong>Saint Yared</strong> (6th century) is truly the <em>father of Ethiopian church music</em> and one of our most significant saints.</p>

<h3>Divine Inspiration:</h3>
<p>According to our tradition, Saint Yared received the <strong>three modes of church music</strong> through divine inspiration after hearing angels singing:</p>

<ul>
<li><strong>Ge'ez (ግዕዝ):</strong> Used during ordinary times</li>
<li><strong>Ezel (እዝል):</strong> Used during fasting periods</li>
<li><strong>Araray (አራራይ):</strong> Used during major feasts</li>
</ul>

<h3>Musical Innovation:</h3>
<ul>
<li><strong>Notation System:</strong> Created sophisticated musical notation still used today</li>
<li><strong>Liturgical Composition:</strong> Composed hymns that form the backbone of our worship</li>
<li><strong>Preservation:</strong> Systematized ancient Ethiopian Christian musical traditions</li>
</ul>

<h3>Lasting Legacy:</h3>
<p>Saint Yared's work created a <em>unique liturgical music tradition</em> that is:</p>
<ul>
<li><strong>Distinctly Ethiopian</strong> while maintaining orthodox Christian content</li>
<li><strong>Spiritually profound</strong> - the music itself is a form of prayer</li>
<li><strong>Historically continuous</strong> - unchanged for over 1,400 years</li>
</ul>

<blockquote>
<p>When we sing the liturgy according to Saint Yared's tradition, we join our voices with the angels who first inspired this sacred music.</p>
</blockquote>

<p>His feast day is celebrated on <strong>19 Genbot</strong> (May 27), and his musical legacy continues to be the foundation of Ethiopian Orthodox worship worldwide.</p>`,
    questionIndex: 7,
    authorIndex: 1 // Deacon Michael
  }
]

const sampleComments = [
  {
    content: `<p>Thank you for this detailed explanation. Could you recommend specific books or resources for deeper study of Ethiopian Orthodox theology?</p>
    
<p>I'm particularly interested in reading our <strong>church fathers</strong> in translation.</p>`,
    authorIndex: 4, // Helen Tadesse
    questionIndex: 0
  },
  {
    content: `<p>This is very helpful. I was confused about the timing.</p>

<p>Is the three-day fast <em>absolute</em>, or can it be adjusted for health reasons? My elderly mother wants to participate but has dietary restrictions.</p>`,
    authorIndex: 2, // Sara Abraham
    questionIndex: 1
  },
  {
    content: `<p>Fascinating! I had no idea about the connection between <strong>Enoch</strong> and the New Testament.</p>

<p>This makes me want to read these books more carefully. Are there good English translations available?</p>`,
    authorIndex: 3, // Dawit Mekonnen
    questionIndex: 2
  },
  {
    content: `<p>I appreciate the balanced approach to this topic.</p>

<blockquote>It's important to maintain both faith and scholarly integrity.</blockquote>

<p>Thank you for addressing this sensitive subject with such wisdom.</p>`,
    authorIndex: 4, // Helen Tadesse
    questionIndex: 3
  },
  {
    content: `<p>As someone who recently started attending regularly, this guidance is <em>invaluable</em>.</p>

<p>Thank you for the clear instructions. I feel much more confident about approaching the <strong>Eucharist</strong> properly now.</p>`,
    authorIndex: 5, // Abraham Wolde
    questionIndex: 4
  }
]

async function seedDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)
  
  try {
    console.log("🌱 Starting database seeding...")
    
    // Clear existing data (in correct order due to foreign keys)
    console.log("🧹 Clearing existing data...")
    await sql`DELETE FROM likes`
    await sql`DELETE FROM comments`
    await sql`DELETE FROM answers`
    await sql`DELETE FROM questions`
    await sql`DELETE FROM users`
    
    // Insert users
    console.log("👥 Seeding users...")
    for (const user of sampleUsers) {
      await sql`
        INSERT INTO users (id, email, name, display_name, image, photo_url, is_admin, created_at, updated_at)
        VALUES (${user.id}, ${user.email}, ${user.name}, ${user.displayName}, ${user.image}, ${user.photoURL}, ${user.isAdmin}, NOW(), NOW())
      `
    }
    
    // Insert questions and get their IDs
    console.log("❓ Seeding questions...")
    const questionIds: number[] = []
    for (const question of sampleQuestions) {
      const author = sampleUsers[question.authorIndex]
      const result = await sql`
        INSERT INTO questions (title, content, author_id, status, category, votes, created_at, updated_at)
        VALUES (${question.title}, ${question.content}, ${author.id}, 'published', ${question.category}, ${Math.floor(Math.random() * 20)}, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days', NOW())
        RETURNING id
      `
      questionIds.push(result[0].id)
    }
    
    // Insert answers
    console.log("💬 Seeding answers...")
    const answerIds: number[] = []
    for (const answer of sampleAnswers) {
      const author = sampleUsers[answer.authorIndex]
      const questionId = questionIds[answer.questionIndex]
      const result = await sql`
        INSERT INTO answers (content, question_id, author_id, votes, is_accepted, created_at, updated_at)
        VALUES (${answer.content}, ${questionId}, ${author.id}, ${Math.floor(Math.random() * 15)}, ${Math.random() > 0.8}, NOW() - INTERVAL '${Math.floor(Math.random() * 25)} days', NOW())
        RETURNING id
      `
      answerIds.push(result[0].id)
    }
    
    // Insert comments
    console.log("💭 Seeding comments...")
    for (const comment of sampleComments) {
      const author = sampleUsers[comment.authorIndex]
      const questionId = questionIds[comment.questionIndex]
      await sql`
        INSERT INTO comments (content, author_id, question_id, created_at, updated_at)
        VALUES (${comment.content}, ${author.id}, ${questionId}, NOW() - INTERVAL '${Math.floor(Math.random() * 20)} days', NOW())
      `
    }
    
    // Add some random likes
    console.log("👍 Seeding likes...")
    for (let i = 0; i < 50; i++) {
      const userId = sampleUsers[Math.floor(Math.random() * sampleUsers.length)].id
      const targetType = Math.random() > 0.5 ? 'question' : 'answer'
      const targetId = targetType === 'question' 
        ? questionIds[Math.floor(Math.random() * questionIds.length)]
        : answerIds[Math.floor(Math.random() * answerIds.length)]
      
      try {
        await sql`
          INSERT INTO likes (user_id, target_type, target_id, created_at)
          VALUES (${userId}, ${targetType}, ${targetId}, NOW() - INTERVAL '${Math.floor(Math.random() * 15)} days')
          ON CONFLICT (user_id, target_type, target_id) DO NOTHING
        `
      } catch (error) {
        // Ignore duplicate key errors
      }
    }
    
    // Update vote counts based on likes
    console.log("🔄 Updating vote counts...")
    await sql`
      UPDATE questions 
      SET votes = (
        SELECT COUNT(*) 
        FROM likes 
        WHERE target_type = 'question' AND target_id = questions.id
      )
    `
    
    await sql`
      UPDATE answers 
      SET votes = (
        SELECT COUNT(*) 
        FROM likes 
        WHERE target_type = 'answer' AND target_id = answers.id
      )
    `
    
    // Final statistics
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM questions) as questions,
        (SELECT COUNT(*) FROM answers) as answers,
        (SELECT COUNT(*) FROM comments) as comments,
        (SELECT COUNT(*) FROM likes) as likes
    `
    
    console.log("✅ Database seeding completed successfully!")
    console.log("\n📊 Seeded data summary:")
    console.log(`   👥 Users: ${stats[0].users}`)
    console.log(`   ❓ Questions: ${stats[0].questions}`)
    console.log(`   💬 Answers: ${stats[0].answers}`)
    console.log(`   💭 Comments: ${stats[0].comments}`)
    console.log(`   👍 Likes: ${stats[0].likes}`)
    
    console.log("\n🎉 Your Tewahedo Forum is now populated with sample data!")
    console.log("🚀 You can now run 'npm run dev' to see the seeded content.")
    
  } catch (error) {
    console.error("❌ Seeding failed:", error)
    process.exit(1)
  }
}

seedDatabase()