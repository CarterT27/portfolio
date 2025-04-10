import type { Experience, Project } from "@/types"

// This is a placeholder for the actual YAML parsing logic
// In a real implementation, you would use fs to read the YAML files in a server component
// or fetch them from an API endpoint

export async function getExperiences(): Promise<Experience[]> {
  // In a real implementation, this would read from a YAML file
  // For now, we'll return mock data
  return [
    {
      company: "Amazon",
      role: "Software Development Engineer Intern",
      date: "Expected Summer 2025",
      description: "Incoming SDEI at Amazon.",
      url: "https://www.amazon.com",
      avatar_state: {
        background: "amazon_seattle.png",
        layers: [
          { image: "amazon.png", zIndex: 10, width: 192, height: 192, x: 0, y: 0, bounce: false },
          { image: "rocket.png", zIndex: 20, width: 80, height: 80, x: 100, y: -100, bounce: true },
        ],
      },
    },
    {
      company: "Translational Neurophysiology Lab | UC San Diego Health",
      role: "Machine Learning Researcher",
      date: "Sep. 2024 - Present",
      description: "Fine-tune foundational EEG Transformer model for real-time seizure detection and discover quantitative biomarkers using EEG and EMG data.",
      url: "https://neurosciences.ucsd.edu/research/labs/ung/index.html#",
      avatar_state: {
        layers: [
          { image: "brain.png", zIndex: 10, width: 100, height: 100, x: 0, y: 0, bounce: false },
        ],
      },
    },
    {
      company: "WorldQuant",
      role: "Quantitative Research Consultant",
      date: "May 2024 - Present",
      description: "Research, implement, and backtest equity trading strategies for potential portfolio integration. National Finalist in International Quant Championship 2024.",
      url: "https://worldquant.com",
      avatar_state: {
        layers: [
          // { image: "suit.png", zIndex: 10, width: 192, height: 192, x: 0, y: 0, bounce: false },
          { image: "candlesticks.png", zIndex: 10, width: 192, height: 192, x: 0, y: 0, bounce: false },
        ],
      },
    },
    {
      company: "UC San Diego",
      role: "Teaching Assistant",
      date: "Mar. 2024 - Present",
      description: "Tutor for DSC 20: Programming and Data Structures (Python), DSC 30: Data Structures and Algorithms (Java).",
      url: "https://datascience.ucsd.edu/",
      avatar_state: {
        background: "geisel.png",
        layers: [
          { image: "java.png", zIndex: 10, width: 100, height: 100, x: -50, y: 0, bounce: false },
          { image: "python.png", zIndex: 20, width: 100, height: 100, x: 50, y: 0, bounce: false },
        ],
      },
    },
    {
      company: "Triton Quantitative Trading",
      role: "VP of Machine Learning",
      date: "Oct. 2023 - Present",
      description: "Lead machine learning initiatives, achieving 1st place in multiple QuantConnect League competitions.",
      url: "https://www.tquantt.com",
      avatar_state: {
        background: "geisel.png",
        layers: [
          { image: "candlesticks.png", zIndex: 10, width: 192, height: 192, x: 0, y: 0, bounce: false },
        ],
      },
    },
    {
      company: "Nationwide Pet",
      role: "Data Analytics Intern",
      date: "Jun. 2022 - Jul. 2022",
      description: "Analyzed claims data to improve the standard of care for our furry friends.",
      url: "https://www.petinsurance.com/",
      avatar_state: {
        background: "basis.png",
        layers: [
          { image: "nationwide.png", zIndex: 10, width: 192, height: 192, x: 0, y: 0, bounce: false },
          { image: "dog.png", zIndex: 20, width: 100, height: 100, x: 70, y: 50, bounce: true },
        ],
      },
    },
  ]
}

export async function getProjects(): Promise<Project[]> {
  // In a real implementation, this would read from a YAML file
  // For now, we'll return mock data
  return [
    {
      title: "Algorithmic Trading Bot",
      summary: "Trading system using quantitative analysis and machine learning",
      description:
        "Engineered features with TA-Lib and scipy for quantitative data, NLTK and spaCy for sentiment analysis. Developed trading strategies on QuantConnect with scikit-learn and XGBoost for performance improvement.",
      tags: ["Python", "C#", "Quantitative Finance", "Machine Learning"],
      github: null,
      live: null,
      image: "/logos/quantconnect.png",
    },
    {
      title: "Tennis Match Prediction",
      summary: "Data engineering pipeline for ATP Tour tennis match prediction",
      description:
        "Developed vectorized and event-driven backtesting frameworks for tennis matches and odds. Asynchronously scraped data with playwright and reverse-engineered tennis websites to optimize bandwidth usage.",
      tags: ["Python", "Data Engineering", "Web Scraping", "Playwright"],
      github: null,
      live: null,
      image: "/logos/atptour.png",
    },
    {
      title: "Social Media Question-Answering",
      summary: "Search and question-answering system for social media content",
      description:
        "Engineered database of social media content across Twitter and Youtube, enabling advanced search and question-answering. Implemented transcription with OpenAI Whisper and topic modeling with BERTopic to extract key themes across influencers. Created an interactive graph of thematic relationships between content using D3.js.",
      tags: ["Large Language Models", "Topic Modeling", "Question-Answering", "D3.js"],
      github: null,
      live: null,
      image: "/logos/obsidian.png",
    },
    {
      title: "FASTER",
      summary: "Feature Automation, Selection, Transformation, Extraction Routine",
      description:
        "Automated an ETL pipeline with OpenRouter API for integrating LLM domain knowledge into the AutoML paradigm. Validated performance of generated features using XGBoost and scikit-learn models across 3 benchmark datasets.",
      tags: ["Python", "Large Language Models", "AutoML", "ETL"],
      github: null,
      live: null,
      image: "/logos/automl.png",
    },
    {
      title: "txtTutor",
      summary: "Document question-answering application with LLM integration",
      description:
        "Developed a RAG-based application using OpenAI APIs and custom vector search database. Utilized Heroku for hosting, deployment, and scaling to support 100+ monthly users.",
      tags: ["Python", "Large Language Models", "RAG", "Heroku"],
      github: null,
      live: null,
      image: "/logos/txtTutor.svg",
      imageScale: 1,
    },
    {
      title: "AI Health Insights",
      summary: "Health data analysis and insight generation platform",
      description:
        "Utilized dask to process and analyze millions of rows of Apple Watch health data, identifying key underperforming metrics. Developed health insight generation pipelines leveraging Claude and fine-tuned HuggingFace Large Language Models. Developed an interactive dashboard using plotly/dash to visualize trends, insights, and actionable recommendations. Hosted web server using Cloudflare tunnels.",
      tags: ["Python", "Natural Language Processing", "Big Data", "Dask", "Plotly"],
      github: "https://github.com/CarterT27/Apple-Watch-Personalized-Health-Insights",
      live: null,
      image: "/logos/applehealth.png",
    },
    {
      title: "Personal Portfolio",
      summary: "This website! Built with Next.js and featuring pixel art animations",
      description:
        "Designed and implemented a personal portfolio site with Next.js, featuring a custom pixel art avatar that changes based on scroll position.",
      tags: ["Next.js", "TypeScript", "Pixi.js"],
      github: "https://github.com/CarterT27/portfolio",
      live: null, // unnecessary to self-redirect
      image: "/logos/nextjs.png",
    },
  ]
}
