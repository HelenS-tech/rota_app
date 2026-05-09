# SmartShift

A simple, mobile-friendly rota tool designed to make it easy for staff to view, understand, and claim shifts.

Built as a lightweight alternative to paper rotas and overly complex scheduling systems.

---

## 🚀 Features

- 📅 **Monthly rota view**
- 📆 **Weekly tabs** for easy navigation
- 📊 **Visual availability overview** (calendar map)
- 👥 **Shift claiming system**
- 🔐 **Simple PIN-based staff login**
- 🎨 **Colour-coded shift status**
  - Grey = Available
  - Amber = Partially filled
  - Red = Full
- 📈 **Progress bars** showing how full each shift is
- 📱 **Mobile-first design**

---

## 🧠 How It Works

- Shifts are generated dynamically based on:
  - Day of the week
  - Monthly patterns (e.g. Wednesday events)
  - Special cases (e.g. first Monday biker night)

- Staff can:
  - Select their name
  - Enter a PIN
  - Claim or cancel shifts

- The app stores the selected user locally using `localStorage`.

---

## ⚠️ Current Limitations

- ❌ No shared database (not synced between users)
- ❌ Changes are only visible on the same device
- ❌ No admin controls yet

This version is a **prototype** to test usability and concept.

---

## 💡 Future Improvements

- 🌐 Shared data (Firebase or backend)
- 👨‍💼 Admin dashboard
- 📊 Analytics (unfilled shifts, trends)
- 🔔 Notifications/reminders
- 👥 Multi-user sync in real time

---

## 🛠️ Tech Stack

- HTML
- CSS (custom styling, responsive layout)
- JavaScript (vanilla)

No frameworks — intentionally lightweight and simple.

---

## 🎯 Goal

To create a rota system that is:
- Easy to understand
- Quick to use on a phone
- Visually clear
- More reliable than paper rotas

---

## 📸 Screenshots

(Add screenshots here if you want)

---

## 👨‍💻 Author

Built by Helen Louise

---

## 📄 License

Open source / personal project