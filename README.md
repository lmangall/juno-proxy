
# Juno Proxy (Futura Fork)

This repository contains a fork of [Davide Dal Busco’s Juno Proxy](https://github.com/peterpme/juno-proxy), adapted just before the Internet Computer (IC) introduced native HTTP outcalls with IPv4 and without replication.

We updated and improved Davide’s original proxy (removing outdated parts) and **adapted it to work with Mailgun** (instead of the original service he used).  
This fork is deployed on **Firebase Functions** and used as a proxy layer for sending emails triggered from Juno.

---

## ✨ What is Futura?

**Futura** is a platform designed to preserve memories for a lifetime—and beyond.  
It taps into the deeply human desire for continuity, allowing individuals to remain present even after they’re gone.

-   **Initial focus**: Weddings — one of life’s most meaningful milestones.
    
-   **Long-term vision**: Digital inheritance — ensuring your legacy extends across generations.
    
-   **AI Project (Transcendence)**: Interact with your life’s data, creating a digital self for your descendants.
    

📌 [Pitch Deck](https://futuraprealpha.my.canva.site/)  
📌 [Demo Video](https://www.loom.com/share/cecf9ef01cfe412c9b1774f32536bee7?sid=f158d108-c259-427b-a2a4-0b305b7cafb2)  
📌 [Market Research](https://docs.google.com/document/d/1ESQXFoI6CQZSfpgRaa_Bxf2cjTpZmO2jT7T2Llw4RIc/edit?usp=sharing)

---

## 🔧 Why This Proxy Exists

The **original Juno Proxy** was built to handle limitations in third-party services that did not support **IPv6** or **idempotency keys**.

Our forked version exists because:

-   It was forked **just before the IC released IPv4 support for HTTP outcalls** (removing the need for replication in some cases).
    
-   We **updated and improved the original code**, removing outdated elements.
    
-   We **adapted it for Mailgun** (instead of the original email provider used by Davide).
    
-   It is **deployed on Firebase Functions** for reliability and scalability.
    

---

## 📌 Usage in Futura

-   **Landing Pages**: Used for A/B testing interest across different segments (family, weddings, transcendence, etc.).
    
-   **Email Sending**: Landing pages trigger transactional emails via Mailgun through this proxy.
    
-   **Deployment**: CI/CD pipelines for Juno deploys rely on this proxy for email functionality.
    

Example landing pages:

-   [Family Memories Vault](https://CONTAINER_URL.icp0.io/en/family)
    
-   [Wedding Memories Vault](https://CONTAINER_URL.icp0.io/en/wedding)
    
-   [Transcendence](https://CONTAINER_URL.icp0.io/en/transcendence)
    

Environment URLs:

-   Development: `https://5yoof-ciaaa-aaaal-asevq-cai.icp0.io`
    
-   Production: `https://uocd6-laaaa-aaaal-asfga-cai.icp0.io`
    

---

## 🏗 Futura Repositories

-   **Frontend (Main Demo)** → [futura\_alpha\_nextjs](https://github.com/552020/futura_alpha_nextjs)
    
-   **Frontend (Juno Branch)** → [futura\_alpha\_nextjs/juno](https://github.com/552020/futura_alpha_nextjs/tree/juno)
    
-   **Backend** → [futura\_alpha\_icp](https://github.com/552020/futura_alpha_icp)
    
-   **Mailgun Proxy (this repo)** → [juno-proxy](https://github.com/lmangall/juno-proxy)
    

---

## 📜 License

This project is released under the **GNU Affero General Public License (AGPL)**.  
Originally created by **Davide Dal Busco (Zürich, Switzerland)** and adapted for **Futura** with improvements and Mailgun integration.
