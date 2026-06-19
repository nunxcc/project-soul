# ✦ PROJECT SOUL ✦

![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-AI-orange?style=for-the-badge&logo=google)
![IndexedDB](https://img.shields.io/badge/IndexedDB-Local_Storage-green?style=for-the-badge)

**Project Soul** is an immersive, browser-based Tabletop RPG engine powered by Google's Gemini AI. It transforms standard text generation into a fully reactive gaming experience with an automated inventory, real-time stat tracking, and a dynamic world chronicle.

---

## 🔮 The Vision
Most AI text adventures are just chat boxes. Project Soul is a complete Frontend UI that acts as a bridge between the player and an AI Dungeon Master. As you play, the AI secretly outputs XML-style command tags that the React engine parses in real-time to update your character's health, equip armor, level up your stats, and log world events.

## ✨ Key Features

* **🧠 Reactive AI State Engine:** The AI acts as the system administrator. If you drop a weapon in the story, the AI emits hidden tags (`<update_equipped>-Iron Sword</update_equipped>`) which the UI intercepts and removes from your visual character sheet.
* **🎒 Rich Inventory & Soul System:** Tracks Credits, character levels, XP, attributes, passive skills, active spells, and properties.
* **💾 Persistent Offline Storage:** Built with `idb-keyval` (IndexedDB), allowing for massive, infinitely scaling local saves, including high-res Base64 background wallpapers, without hitting standard 5MB `localStorage` limits.
* **📜 Automatic Chronicle Ledger:** The AI automatically detects major plot points and adds them to a permanent timeline so the DM never "forgets" the canon of your story.
* **🎨 High-Fidelity Gaming UI:** Built with custom CSS glassmorphism, completely native React components (no bloated UI libraries), fading scrollbars, and dynamic theme switching (Destiny, Crimson, Requiem).
* **📖 Storybook Rendering:** Full Markdown support for elegant, readable, and beautifully formatted AI narration.

---

## 🛠️ Under the Hood: How it Works

The magic of Project Soul lies in its robust **System Parser**. The AI is instructed via the System Prompt to append specific tags to the end of its narrative responses.

For example, if you say *"I find a healing potion and 50 credits"*, the Gemini API returns:
```text
You look down and spot a shimmering red vial next to a small pouch of coins.

<update_items>+Healing Potion : Restores 50 HP : 25</update_items>
<update_credits>+50</update_credits>
