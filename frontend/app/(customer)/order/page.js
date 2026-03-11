'use client';
// app/(customer)/order/page.js
// Select a puja → its required samagri items are previewed with prices
// → "Add all to cart" OR "Book & Request Delivery"
// Booking now saves to Supabase via POST /api/puja-orders

import { useState, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// ─── Guru Dakshina fees per puja (paid in person after puja) ─────────────────
const GURU_FEE = {
  tihar:         2100,
  dashain:       2500,
  shivratri:     3100,
  satyanarayan:  2100,
  'griha-pravesh': 5100,
  bratabandha:   5100,
  vivah:         11000,
  nwaran:        2100,
  navagrah:      3100,
  havan:         3500,
};

// ─── Puja Samagri Data ────────────────────────────────────────────────────────
const PUJA_SAMAGRI = [
  {
    id: 'tihar',
    type: 'festival',
    emoji: '🪔',
    name: 'Tihar Puja',
    nameNe: 'तिहार पूजा',
    desc: 'Lakshmi Puja, Gobardhan & Bhai Tika — complete samagri set.',
    items: [
      { id: 'tihar-01', name: 'Marigold Garland (Sayapatri)',  nameNe: 'सयपत्री माला',     qty: 5,  unit: 'pcs', price: 60  },
      { id: 'tihar-02', name: 'Clay Diyas',                    nameNe: 'माटोको दियो',       qty: 21, unit: 'pcs', price: 10  },
      { id: 'tihar-03', name: 'Mustard Oil (100ml)',           nameNe: 'तोरीको तेल',        qty: 1,  unit: 'btl', price: 120 },
      { id: 'tihar-04', name: 'Red Tika Powder (Sindhur)',     nameNe: 'सिन्दूर',           qty: 1,  unit: 'pkt', price: 40  },
      { id: 'tihar-05', name: 'Dhoop Agarbatti (Sandalwood)',  nameNe: 'धूप अगरबत्ती',      qty: 2,  unit: 'box', price: 80  },
      { id: 'tihar-06', name: 'Panchamrit (Set)',              nameNe: 'पञ्चामृत',           qty: 1,  unit: 'set', price: 180 },
      { id: 'tihar-07', name: 'Khoi (Popped Rice)',            nameNe: 'खोई',                qty: 2,  unit: 'pkt', price: 35  },
      { id: 'tihar-08', name: 'Sel Roti Mix',                  nameNe: 'सेल रोटी मिक्स',    qty: 1,  unit: 'kg',  price: 150 },
      { id: 'tihar-09', name: 'Akshata (Coloured Rice)',       nameNe: 'अक्षता',             qty: 1,  unit: 'pkt', price: 30  },
      { id: 'tihar-10', name: 'Copper Kalash',                 nameNe: 'तामाको कलश',        qty: 1,  unit: 'pcs', price: 350 },
    ],
  },
  {
    id: 'dashain',
    type: 'festival',
    emoji: '⚔️',
    name: 'Dashain Puja',
    nameNe: 'दशैं पूजा',
    desc: 'Ghatasthapana to Vijaya Dashami — complete Navaratri samagri.',
    items: [
      { id: 'dashain-01', name: 'Jamara Seeds (Barley)',        nameNe: 'जमरा बीउ',           qty: 2,  unit: 'pkt', price: 50  },
      { id: 'dashain-02', name: 'Sand / Black Soil',            nameNe: 'माटो',               qty: 1,  unit: 'bag', price: 40  },
      { id: 'dashain-03', name: 'Ghatasthapana Kalash Set',     nameNe: 'घटस्थापना सेट',      qty: 1,  unit: 'set', price: 450 },
      { id: 'dashain-04', name: 'Red Cloth (2m)',               nameNe: 'रातो कपडा',          qty: 1,  unit: 'pcs', price: 200 },
      { id: 'dashain-05', name: 'Tika Ingredients (Full Set)',  nameNe: 'टीका सेट',           qty: 1,  unit: 'set', price: 280 },
      { id: 'dashain-06', name: 'Coconut',                      nameNe: 'नरिवल',              qty: 2,  unit: 'pcs', price: 80  },
      { id: 'dashain-07', name: 'Dhoop Agarbatti Pack',         nameNe: 'धूप अगरबत्ती',      qty: 3,  unit: 'box', price: 80  },
      { id: 'dashain-08', name: 'Panchamrit (Set)',             nameNe: 'पञ्चामृत',           qty: 1,  unit: 'set', price: 180 },
      { id: 'dashain-09', name: 'Akshata (Coloured Rice)',      nameNe: 'अक्षता',             qty: 2,  unit: 'pkt', price: 30  },
      { id: 'dashain-10', name: 'Brass Diya (Large)',           nameNe: 'पित्तलको दियो',      qty: 1,  unit: 'pcs', price: 320 },
      { id: 'dashain-11', name: 'Puja Flower Mix',              nameNe: 'फूल मिक्स',          qty: 3,  unit: 'pkt', price: 60  },
    ],
  },
  {
    id: 'shivratri',
    type: 'festival',
    emoji: '🔱',
    name: 'Maha Shivratri',
    nameNe: 'महाशिवरात्री',
    desc: 'All-night Shiva jagaran with Rudrabhishek & 108 diya offering.',
    items: [
      { id: 'shiv-01', name: 'Bilva Leaves (Bel Patra)',        nameNe: 'बेलपत्र',            qty: 1,  unit: 'bunch', price: 60  },
      { id: 'shiv-02', name: 'Dhatura Flower',                  nameNe: 'धतुरा फूल',          qty: 1,  unit: 'pkt',   price: 50  },
      { id: 'shiv-03', name: 'Raw Milk (1L)',                   nameNe: 'कच्चा दूध',           qty: 2,  unit: 'ltr',   price: 120 },
      { id: 'shiv-04', name: 'Panchamrit (Set)',                nameNe: 'पञ्चामृत',            qty: 2,  unit: 'set',   price: 180 },
      { id: 'shiv-05', name: 'Rudraksha Mala',                  nameNe: 'रुद्राक्ष माला',      qty: 1,  unit: 'pcs',   price: 650 },
      { id: 'shiv-06', name: 'Clay Diyas (Pack of 108)',        nameNe: 'माटोको दियो',         qty: 1,  unit: 'pack',  price: 180 },
      { id: 'shiv-07', name: 'Camphor (Kapoor)',                nameNe: 'कपूर',                qty: 2,  unit: 'pkt',   price: 45  },
      { id: 'shiv-08', name: 'Charcoal Dhoop',                  nameNe: 'कोइला धूप',           qty: 1,  unit: 'pkt',   price: 90  },
      { id: 'shiv-09', name: 'Chandan (Sandalwood Paste)',      nameNe: 'चन्दन',               qty: 1,  unit: 'tube',  price: 130 },
      { id: 'shiv-10', name: 'Black Sesame Seeds',              nameNe: 'तिल',                 qty: 1,  unit: 'pkt',   price: 40  },
    ],
  },
  {
    id: 'satyanarayan',
    type: 'karma',
    emoji: '🌙',
    name: 'Satyanarayan Katha',
    nameNe: 'सत्यनारायण कथा',
    desc: 'Lord Vishnu Vrat katha with kalash, panchamrit & prasad.',
    items: [
      { id: 'saty-01', name: 'Banana (Kera)',                   nameNe: 'केरा',               qty: 5,  unit: 'pcs',  price: 20  },
      { id: 'saty-02', name: 'Panchamrit (Set)',                nameNe: 'पञ्चामृत',            qty: 2,  unit: 'set',  price: 180 },
      { id: 'saty-03', name: 'Copper Kalash',                   nameNe: 'तामाको कलश',         qty: 1,  unit: 'pcs',  price: 350 },
      { id: 'saty-04', name: 'Yellow Cloth (2m)',               nameNe: 'पहेंलो कपडा',         qty: 1,  unit: 'pcs',  price: 180 },
      { id: 'saty-05', name: 'Tulsi Leaves',                    nameNe: 'तुलसी पत्र',          qty: 1,  unit: 'bunch',price: 30  },
      { id: 'saty-06', name: 'Suji (Semolina) 250g',           nameNe: 'सुजी',                qty: 2,  unit: 'pkt',  price: 60  },
      { id: 'saty-07', name: 'Dhoop Agarbatti Pack',            nameNe: 'धूप अगरबत्ती',       qty: 1,  unit: 'box',  price: 80  },
      { id: 'saty-08', name: 'Ghee (200ml)',                    nameNe: 'घिउ',                qty: 1,  unit: 'jar',  price: 280 },
      { id: 'saty-09', name: 'Akshata (Coloured Rice)',         nameNe: 'अक्षता',              qty: 1,  unit: 'pkt',  price: 30  },
      { id: 'saty-10', name: 'Brass Diya (Small)',              nameNe: 'पित्तलको दियो',       qty: 2,  unit: 'pcs',  price: 180 },
    ],
  },
  {
    id: 'griha-pravesh',
    type: 'karma',
    emoji: '🏠',
    name: 'Griha Pravesh',
    nameNe: 'गृहप्रवेश',
    desc: 'Vastu puja, kalash sthapana & grihashanti havan samagri.',
    items: [
      { id: 'grih-01', name: 'Havan Kund (Medium)',             nameNe: 'हवन कुण्ड',          qty: 1,  unit: 'pcs',  price: 850 },
      { id: 'grih-02', name: 'Havan Samagri (1kg)',             nameNe: 'हवन सामग्री',        qty: 2,  unit: 'kg',   price: 320 },
      { id: 'grih-03', name: 'Copper Kalash (Large)',           nameNe: 'ठूलो कलश',           qty: 1,  unit: 'pcs',  price: 550 },
      { id: 'grih-04', name: 'Coconut',                         nameNe: 'नरिवल',               qty: 5,  unit: 'pcs',  price: 80  },
      { id: 'grih-05', name: 'Mango Leaves (Aamko Paat)',       nameNe: 'आँपको पात',           qty: 2,  unit: 'bunch',price: 50  },
      { id: 'grih-06', name: 'Red Cloth (3m)',                  nameNe: 'रातो कपडा',           qty: 1,  unit: 'pcs',  price: 280 },
      { id: 'grih-07', name: 'Camphor (Kapoor)',                nameNe: 'कपूर',                qty: 3,  unit: 'pkt',  price: 45  },
      { id: 'grih-08', name: 'Ghee (500ml)',                    nameNe: 'घिउ',                qty: 1,  unit: 'jar',  price: 620 },
      { id: 'grih-09', name: 'Panchamrit (Set)',                nameNe: 'पञ्चामृत',            qty: 2,  unit: 'set',  price: 180 },
      { id: 'grih-10', name: 'Puja Flower Mix',                 nameNe: 'फूल मिक्स',           qty: 5,  unit: 'pkt',  price: 60  },
      { id: 'grih-11', name: 'Lal Chandan (Red Sandalwood)',    nameNe: 'रातो चन्दन',          qty: 1,  unit: 'pkt',  price: 150 },
      { id: 'grih-12', name: 'Dhoop Agarbatti (3 Box)',         nameNe: 'धूप अगरबत्ती',       qty: 3,  unit: 'box',  price: 80  },
    ],
  },
  {
    id: 'bratabandha',
    type: 'karma',
    emoji: '📿',
    name: 'Bratabandha',
    nameNe: 'ब्रतबन्ध',
    desc: 'Sacred thread ceremony — upanayana, yagyopavit & Gayatri mantra.',
    items: [
      { id: 'brat-01', name: 'Yagyopavit (Sacred Thread)',      nameNe: 'यज्ञोपवित',           qty: 3,  unit: 'pcs',  price: 120 },
      { id: 'brat-02', name: 'Havan Kund (Medium)',             nameNe: 'हवन कुण्ड',            qty: 1,  unit: 'pcs',  price: 850 },
      { id: 'brat-03', name: 'Havan Samagri (500g)',            nameNe: 'हवन सामग्री',          qty: 2,  unit: 'pkt',  price: 180 },
      { id: 'brat-04', name: 'White Dhoti Cloth (3m)',          nameNe: 'सेतो धोती',            qty: 1,  unit: 'pcs',  price: 350 },
      { id: 'brat-05', name: 'Copper Kalash',                   nameNe: 'तामाको कलश',          qty: 1,  unit: 'pcs',  price: 350 },
      { id: 'brat-06', name: 'Ghee (200ml)',                    nameNe: 'घिउ',                 qty: 2,  unit: 'jar',  price: 280 },
      { id: 'brat-07', name: 'Panchamrit (Set)',                nameNe: 'पञ्चामृत',             qty: 1,  unit: 'set',  price: 180 },
      { id: 'brat-08', name: 'Tika Set (Full)',                 nameNe: 'टीका सेट',             qty: 1,  unit: 'set',  price: 280 },
      { id: 'brat-09', name: 'Black Sesame Seeds',              nameNe: 'तिल',                  qty: 1,  unit: 'pkt',  price: 40  },
      { id: 'brat-10', name: 'Darbha Grass',                    nameNe: 'दर्भा',                qty: 1,  unit: 'bunch',price: 60  },
    ],
  },
  {
    id: 'vivah',
    type: 'karma',
    emoji: '💍',
    name: 'Vivah Puja',
    nameNe: 'विवाह पूजा',
    desc: 'Full Vedic wedding — lagna puja, saptapadi & sindur daan.',
    items: [
      { id: 'vivah-01', name: 'Sindur (Vermilion Set)',         nameNe: 'सिन्दूर सेट',         qty: 2,  unit: 'set',  price: 150 },
      { id: 'vivah-02', name: 'Copper Kalash (Large)',          nameNe: 'ठूलो कलश',            qty: 2,  unit: 'pcs',  price: 550 },
      { id: 'vivah-03', name: 'Havan Kund (Large)',             nameNe: 'ठूलो हवन कुण्ड',      qty: 1,  unit: 'pcs',  price: 1200},
      { id: 'vivah-04', name: 'Havan Samagri (2kg)',            nameNe: 'हवन सामग्री',          qty: 1,  unit: 'set',  price: 580 },
      { id: 'vivah-05', name: 'Marigold Garland x10',           nameNe: 'माला सेट',             qty: 10, unit: 'pcs',  price: 60  },
      { id: 'vivah-06', name: 'Ghee (1L)',                      nameNe: 'घिउ',                 qty: 1,  unit: 'jar',  price: 1100},
      { id: 'vivah-07', name: 'Panchamrit (Large Set)',         nameNe: 'पञ्चामृत',             qty: 3,  unit: 'set',  price: 180 },
      { id: 'vivah-08', name: 'Puja Flower Mix (Large)',        nameNe: 'फूल मिक्स',            qty: 8,  unit: 'pkt',  price: 60  },
      { id: 'vivah-09', name: 'Red & Yellow Cloth (3m each)',   nameNe: 'कपडा सेट',             qty: 1,  unit: 'set',  price: 650 },
      { id: 'vivah-10', name: 'Darbha Grass',                   nameNe: 'दर्भा',                qty: 2,  unit: 'bunch',price: 60  },
      { id: 'vivah-11', name: 'Coconut',                        nameNe: 'नरिवल',                qty: 5,  unit: 'pcs',  price: 80  },
      { id: 'vivah-12', name: 'Akshata (Large)',                nameNe: 'अक्षता',               qty: 3,  unit: 'pkt',  price: 30  },
    ],
  },
  {
    id: 'nwaran',
    type: 'karma',
    emoji: '👶',
    name: 'Nwaran (Baby Naming)',
    nameNe: 'न्वारन संस्कार',
    desc: 'Traditional naming, sun darshan & rice feeding ritual.',
    items: [
      { id: 'nwar-01', name: 'Panchamrit (Set)',                nameNe: 'पञ्चामृत',             qty: 1,  unit: 'set',  price: 180 },
      { id: 'nwar-02', name: 'Yellow Cloth (1m)',               nameNe: 'पहेंलो कपडा',          qty: 1,  unit: 'pcs',  price: 120 },
      { id: 'nwar-03', name: 'Puja Flower Mix',                 nameNe: 'फूल मिक्स',             qty: 2,  unit: 'pkt',  price: 60  },
      { id: 'nwar-04', name: 'Akshata (Coloured Rice)',         nameNe: 'अक्षता',               qty: 1,  unit: 'pkt',  price: 30  },
      { id: 'nwar-05', name: 'Tika Set',                        nameNe: 'टीका सेट',              qty: 1,  unit: 'set',  price: 280 },
      { id: 'nwar-06', name: 'Dhoop Agarbatti',                 nameNe: 'धूप अगरबत्ती',         qty: 1,  unit: 'box',  price: 80  },
      { id: 'nwar-07', name: 'Small Brass Diya',                nameNe: 'पित्तलको दियो',        qty: 1,  unit: 'pcs',  price: 180 },
    ],
  },
  {
    id: 'navagrah',
    type: 'karma',
    emoji: '💫',
    name: 'Navagrah Puja',
    nameNe: 'नवग्रह पूजा',
    desc: 'Nine planetary deity worship to remove dosh & bring harmony.',
    items: [
      { id: 'nava-01', name: 'Navagrah Samagri Set',            nameNe: 'नवग्रह सामग्री',       qty: 1,  unit: 'set',  price: 950 },
      { id: 'nava-02', name: 'Nine Coloured Cloth (1m each)',   nameNe: 'नौ रंगको कपडा',        qty: 1,  unit: 'set',  price: 720 },
      { id: 'nava-03', name: 'Havan Samagri (500g)',            nameNe: 'हवन सामग्री',           qty: 1,  unit: 'pkt',  price: 180 },
      { id: 'nava-04', name: 'Ghee (200ml)',                    nameNe: 'घिउ',                  qty: 1,  unit: 'jar',  price: 280 },
      { id: 'nava-05', name: 'Panchamrit (Set)',                nameNe: 'पञ्चामृत',              qty: 1,  unit: 'set',  price: 180 },
      { id: 'nava-06', name: 'Black Sesame & Til Mix',          nameNe: 'तिल मिक्स',             qty: 1,  unit: 'pkt',  price: 60  },
      { id: 'nava-07', name: 'Nine Grain Mix (Navadhanya)',     nameNe: 'नवधान्य',               qty: 1,  unit: 'pkt',  price: 150 },
      { id: 'nava-08', name: 'Camphor (Kapoor)',                nameNe: 'कपूर',                  qty: 2,  unit: 'pkt',  price: 45  },
    ],
  },
  {
    id: 'havan',
    type: 'karma',
    emoji: '🔥',
    name: 'Havan & Yagya',
    nameNe: 'हवन यज्ञ',
    desc: 'Complete havan samagri for health, prosperity, or any occasion.',
    items: [
      { id: 'hav-01',  name: 'Havan Kund (Medium)',             nameNe: 'हवन कुण्ड',             qty: 1,  unit: 'pcs',  price: 850 },
      { id: 'hav-02',  name: 'Havan Samagri (1kg)',             nameNe: 'हवन सामग्री',           qty: 2,  unit: 'kg',   price: 320 },
      { id: 'hav-03',  name: 'Ghee (500ml)',                    nameNe: 'घिउ',                  qty: 1,  unit: 'jar',  price: 620 },
      { id: 'hav-04',  name: 'Darbha Grass',                    nameNe: 'दर्भा',                 qty: 2,  unit: 'bunch',price: 60  },
      { id: 'hav-05',  name: 'Camphor (Kapoor)',                nameNe: 'कपूर',                  qty: 2,  unit: 'pkt',  price: 45  },
      { id: 'hav-06',  name: 'Black Sesame Seeds',              nameNe: 'तिल',                  qty: 1,  unit: 'pkt',  price: 40  },
      { id: 'hav-07',  name: 'Copper Kalash',                   nameNe: 'तामाको कलश',           qty: 1,  unit: 'pcs',  price: 350 },
      { id: 'hav-08',  name: 'Coconut',                         nameNe: 'नरिवल',                qty: 3,  unit: 'pcs',  price: 80  },
    ],
  },
];

const TYPE_LABELS = { festival: '🎪 Festival', karma: '🕉️ Karma Kanda' };

export default function PujaOrderPage() {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [added, setAdded] = useState(null);

  const [showBooking, setShowBooking]   = useState(false);
  const [bookingPuja, setBookingPuja]   = useState(null);
  const [bookingForm, setBookingForm]   = useState({ name: '', phone: '', location: '', date: '', note: '' });
  const [booking, setBooking]           = useState(false);
  const [bookingDone, setBookingDone]   = useState(false);
  const [bookingError, setBookingError] = useState('');

  const filtered = filter === 'all' ? PUJA_SAMAGRI : PUJA_SAMAGRI.filter(p => p.type === filter);
  const total = (puja) => puja.items.reduce((s, it) => s + it.price * it.qty, 0);

  const handleAddToCart = useCallback((puja) => {
    puja.items.forEach(item => {
      addToCart({
        id: item.id,
        name: `${item.name} — ${puja.name}`,
        price: item.price,
        quantity: item.qty,
        category: puja.nameNe,
        image: null,
      });
    });
    setAdded(puja.id);
    setSelected(null);
    setTimeout(() => setAdded(null), 3000);
  }, [addToCart]);

  const openBooking = (puja) => {
    setBookingPuja(puja);
    setBookingForm({ name: '', phone: '', location: '', date: '', note: '' });
    setBookingError('');
    setBookingDone(false);
    setShowBooking(true);
    setSelected(null);
  };

  const handleBooking = async () => {
    const { name, phone, location, date } = bookingForm;
    if (!name.trim() || !phone.trim() || !location.trim() || !date) {
      setBookingError('कृपया नाम, फोन, ठेगाना र मिति भर्नुहोस् / Please fill in name, phone, location, and date.');
      return;
    }
    setBooking(true);
    setBookingError('');

    try {
      const guruFee = GURU_FEE[bookingPuja.id] ?? 2100;
      const res = await fetch('/api/puja-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puja_id:      bookingPuja.id,
          puja_name:    bookingPuja.name,
          puja_name_ne: bookingPuja.nameNe,
          name:         name.trim(),
          phone:        phone.trim(),
          location:     location.trim(),
          date,
          note:         bookingForm.note.trim() || null,
          items:        bookingPuja.items,
          total_price:  total(bookingPuja),
          guru_dakshina: guruFee,
          user_id:      user?.id ?? null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit booking');
      setBookingDone(true);
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setBooking(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;600;800&display=swap');

        :root {
          --gold: #facc15; --orange: #f97316; --green: #22c55e;
          --bg: #080d18; --surface: #0c1220; --surface2: #111827;
          --border: #1a2540; --border2: #1e293b; --muted: #475569; --text: #f1f5f9;
          --saffron: #f59e0b; --saffron-dim: rgba(245,158,11,0.12);
        }

        @keyframes fadeUp    { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer   { 0%,100% { background-position:-200% center; } 50% { background-position:200% center; } }
        @keyframes rotateSlow { to { transform:rotate(360deg); } }
        @keyframes overlayIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes modalIn    { from { opacity:0; transform:translateY(28px) scale(0.97); } to { opacity:1; transform:none; } }
        @keyframes toastIn    { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        @keyframes itemStagger { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:none; } }
        @keyframes cardIn    { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        @keyframes diyaPulse { 0%,100%{opacity:0.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }

        .op-page {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg); color: var(--text);
          min-height: 100vh; padding: 56px 24px 100px; position: relative;
        }
        .hero { text-align: center; margin-bottom: 52px; animation: fadeUp 0.5s ease both; position: relative; }
        .hero-ring {
          position: absolute; width: 480px; height: 480px; border-radius: 50%;
          border: 1px solid rgba(250,204,21,0.06);
          top: 50%; left: 50%; transform: translate(-50%,-56%);
          animation: rotateSlow 50s linear infinite; pointer-events: none;
        }
        .hero-ring2 {
          position: absolute; width: 320px; height: 320px; border-radius: 50%;
          border: 1px dashed rgba(250,204,21,0.04);
          top: 50%; left: 50%; transform: translate(-50%,-56%);
          animation: rotateSlow 30s linear infinite reverse; pointer-events: none;
        }
        .eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(250,204,21,0.08); border: 1px solid rgba(250,204,21,0.18);
          border-radius: 999px; padding: 6px 20px;
          font-size: 11px; font-weight: 800; color: var(--gold);
          letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;
        }
        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 5.5vw, 62px); font-weight: 700; line-height: 1.08;
          color: var(--text); margin: 0 0 14px;
        }
        .hero-title em {
          font-style: italic;
          background: linear-gradient(90deg, var(--gold), var(--orange), var(--gold));
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: shimmer 5s linear infinite;
        }
        .hero-sub { color: var(--muted); font-size: 15px; max-width: 500px; margin: 0 auto; line-height: 1.7; }

        .cart-pill {
          display: flex; align-items: center; gap: 8px;
          position: fixed; bottom: 28px; right: 28px; z-index: 100;
          background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.3);
          color: var(--green); font-weight: 800; font-size: 14px;
          padding: 14px 22px; border-radius: 999px; cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif; backdrop-filter: blur(12px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .cart-pill:hover { background: rgba(34,197,94,0.2); transform: translateY(-2px); }

        .filter-tabs { display: flex; justify-content: center; gap: 10px; margin-bottom: 48px; flex-wrap: wrap; }
        .tab-btn {
          padding: 10px 22px; border-radius: 999px; border: 1px solid var(--border2);
          background: var(--surface2); color: var(--muted);
          font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .tab-btn:hover { border-color: rgba(250,204,21,0.25); color: #94a3b8; }
        .tab-btn.active { background: rgba(250,204,21,0.08); border-color: rgba(250,204,21,0.3); color: var(--gold); }

        .section-label { font-size: 10px; font-weight: 800; letter-spacing: 3px; color: var(--gold); text-transform: uppercase; margin: 0 0 18px 2px; }
        .section-divider { border: none; border-top: 1px solid var(--border); margin: 36px 0 28px; }

        .pujas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 18px; max-width: 1300px; margin: 0 auto; }

        .puja-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 22px; padding: 26px 22px 20px; cursor: pointer; position: relative; overflow: hidden;
          transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
          animation: cardIn 0.4s ease both;
        }
        .puja-card:hover { transform: translateY(-5px); box-shadow: 0 16px 44px rgba(0,0,0,0.45); border-color: rgba(250,204,21,0.2); }
        .type-badge {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 9px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
          padding: 3px 10px; border-radius: 999px; margin-bottom: 16px;
        }
        .type-badge.festival { background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.2); color: var(--orange); }
        .type-badge.karma    { background: rgba(250,204,21,0.08); border: 1px solid rgba(250,204,21,0.2); color: var(--gold); }
        .card-emoji { font-size: 42px; display: block; margin-bottom: 12px; line-height: 1; }
        .card-name { font-family: 'Cormorant Garamond', serif; font-size: 21px; font-weight: 700; color: var(--text); margin: 0 0 2px; }
        .card-name-ne { font-size: 12px; color: var(--gold); font-style: italic; margin: 0 0 10px; }
        .card-desc { font-size: 12px; color: var(--muted); line-height: 1.6; margin: 0 0 16px; }
        .card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid var(--border); gap: 12px; }
        .card-total { display: flex; flex-direction: column; }
        .total-label { font-size: 9px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); }
        .total-price { font-size: 18px; font-weight: 800; color: var(--gold); }
        .total-items { font-size: 10px; color: #334155; font-weight: 600; margin-top: 1px; }
        .view-btn {
          padding: 10px 18px; background: rgba(250,204,21,0.1); border: 1px solid rgba(250,204,21,0.22);
          color: var(--gold); font-weight: 800; font-size: 12px; border-radius: 12px; cursor: pointer;
          transition: all 0.2s; font-family: 'DM Sans', sans-serif; white-space: nowrap;
        }
        .view-btn:hover { background: rgba(250,204,21,0.18); transform: translateY(-1px); }

        .toast {
          position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
          background: rgba(22,163,74,0.15); border: 1px solid rgba(34,197,94,0.3);
          color: #4ade80; font-weight: 800; font-size: 14px;
          padding: 14px 28px; border-radius: 16px; z-index: 200;
          animation: toastIn 0.3s ease both; backdrop-filter: blur(12px);
          white-space: nowrap; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }

        .overlay {
          position: fixed; inset: 0; z-index: 150; background: rgba(0,0,0,0.82);
          backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center;
          padding: 20px; animation: overlayIn 0.2s ease both;
        }
        .modal {
          background: #0c1220; border: 1px solid rgba(250,204,21,0.18); border-radius: 24px;
          width: 100%; max-width: 560px; max-height: 88vh; overflow-y: auto; padding: 32px 30px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.7);
          animation: modalIn 0.3s cubic-bezier(0.34,1.4,0.64,1) both;
          scrollbar-width: thin; scrollbar-color: rgba(250,204,21,0.15) transparent; position: relative;
        }
        .modal-close {
          position: absolute; top: 16px; right: 16px; width: 30px; height: 30px; border-radius: 50%;
          background: rgba(255,255,255,0.05); border: 1px solid var(--border2);
          color: var(--muted); font-size: 14px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: all 0.2s; font-family: inherit;
        }
        .modal-close:hover { background: rgba(255,255,255,0.1); color: var(--text); }
        .modal-head { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; }
        .modal-emoji { font-size: 40px; }
        .modal-title { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 700; color: var(--text); margin: 0 0 2px; }
        .modal-ne { font-size: 13px; color: var(--gold); font-style: italic; margin: 0; }
        .modal-desc {
          font-size: 12px; color: #334155; line-height: 1.65;
          padding: 10px 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--border);
          border-radius: 10px; margin: 14px 0 22px;
        }
        .items-label { font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
        .items-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 22px; }
        .item-row {
          display: flex; align-items: center; gap: 10px; padding: 10px 14px;
          background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 12px;
          animation: itemStagger 0.3s ease both;
        }
        .item-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); opacity: 0.5; flex-shrink: 0; }
        .item-name-block { flex: 1; min-width: 0; }
        .item-name { font-size: 13px; font-weight: 600; color: #e2e8f0; line-height: 1.3; }
        .item-name-ne { font-size: 11px; color: var(--muted); font-style: italic; }
        .item-qty { font-size: 11px; font-weight: 700; color: #334155; background: rgba(255,255,255,0.04); border: 1px solid var(--border); padding: 2px 8px; border-radius: 6px; white-space: nowrap; }
        .item-price { font-size: 13px; font-weight: 800; color: var(--gold); text-align: right; min-width: 56px; white-space: nowrap; }
        .total-row {
          display: flex; align-items: center; justify-content: space-between; padding: 16px 18px;
          background: rgba(250,204,21,0.06); border: 1px solid rgba(250,204,21,0.18); border-radius: 14px; margin-bottom: 16px;
        }
        .total-row-label { font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: var(--muted); }
        .total-row-count { font-size: 11px; color: #334155; margin-top: 2px; }
        .total-row-price { font-size: 24px; font-weight: 800; color: var(--gold); }
        .modal-actions { display: flex; gap: 10px; }
        .add-cart-btn {
          flex: 1; padding: 14px;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          color: #fff; font-weight: 900; font-size: 14px;
          border: none; border-radius: 14px; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s; font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .add-cart-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(34,197,94,0.4); }
        .book-btn {
          flex: 1; padding: 14px;
          background: rgba(250,204,21,0.1); border: 1px solid rgba(250,204,21,0.3);
          color: var(--gold); font-weight: 900; font-size: 14px;
          border-radius: 14px; cursor: pointer;
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .book-btn:hover { background: rgba(250,204,21,0.18); transform: translateY(-2px); }
        .modal-note { color: #1e293b; font-size: 11px; text-align: center; margin-top: 10px; font-weight: 600; }

        /* ── Guru Dakshina Card ──────────────────────────────────────────── */
        .dakshina-card {
          margin: 20px 0 6px;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(245,158,11,0.3);
          background: linear-gradient(135deg, rgba(245,158,11,0.07), rgba(120,53,15,0.12));
        }
        .dakshina-header {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px 10px;
          border-bottom: 1px solid rgba(245,158,11,0.15);
        }
        .dakshina-diya {
          font-size: 22px;
          animation: diyaPulse 2.5s ease-in-out infinite;
          line-height: 1;
        }
        .dakshina-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px; font-weight: 700;
          color: #fcd34d; margin: 0 0 1px;
        }
        .dakshina-subtitle {
          font-size: 11px; color: #92400e; font-weight: 600; margin: 0;
        }
        .dakshina-body { padding: 14px 16px 16px; }
        .dakshina-amount-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 10px;
        }
        .dakshina-amount-label {
          font-size: 11px; font-weight: 800; letter-spacing: 1px;
          text-transform: uppercase; color: #92400e;
        }
        .dakshina-amount {
          font-size: 28px; font-weight: 900;
          color: #fcd34d;
          font-family: 'DM Sans', sans-serif;
        }
        .dakshina-amount span {
          font-size: 14px; font-weight: 700; color: #d97706; margin-right: 2px;
        }
        .dakshina-note {
          display: flex; align-items: flex-start; gap: 8px;
          background: rgba(0,0,0,0.2); border-radius: 10px;
          padding: 10px 12px; font-size: 12px; line-height: 1.6;
          color: #a16207;
        }
        .dakshina-note-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
        .dakshina-rows {
          display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px;
        }
        .dakshina-row {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 12px;
        }
        .dakshina-row-label { color: #a16207; font-weight: 600; }
        .dakshina-row-value { color: #fcd34d; font-weight: 800; }
        .dakshina-row-value.muted { color: #92400e; }
        .dakshina-divider {
          border: none; border-top: 1px dashed rgba(245,158,11,0.2);
          margin: 8px 0;
        }

        /* ── Booking form styles ─────────────────────────────────────────── */
        .booking-modal { max-width: 480px; }
        .form-group { margin-bottom: 14px; }
        .form-label { font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: var(--muted); display: block; margin-bottom: 6px; }
        .form-input {
          width: 100%; background: var(--surface2); border: 1px solid var(--border2);
          border-radius: 10px; padding: 11px 14px; color: var(--text);
          font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s;
        }
        .form-input:focus { border-color: rgba(250,204,21,0.4); }
        .form-input::placeholder { color: #334155; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .booking-error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #f87171; border-radius: 10px; padding: 10px 14px; font-size: 12px; font-weight: 600; margin-bottom: 14px; }
        .submit-booking-btn {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg, #854d0e, #facc15);
          color: #0f172a; border: none; border-radius: 14px;
          font-size: 15px; font-weight: 900; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: transform 0.2s, box-shadow 0.2s;
          margin-top: 16px;
        }
        .submit-booking-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .submit-booking-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(250,204,21,0.3); }
        .booking-success { text-align: center; padding: 20px 0; }
        .booking-success .big-emoji { font-size: 52px; margin-bottom: 14px; display: block; }
        .booking-success h3 { font-family: 'Cormorant Garamond', serif; font-size: 26px; color: var(--gold); margin-bottom: 8px; }
        .booking-success p { font-size: 13px; color: var(--muted); line-height: 1.7; }
        .booking-success .dakshina-reminder {
          margin: 18px 0 0;
          background: rgba(245,158,11,0.08);
          border: 1px solid rgba(245,158,11,0.25);
          border-radius: 14px; padding: 14px 16px;
          font-size: 13px; color: #d97706; font-weight: 600; line-height: 1.6;
        }

        @media (max-width: 480px) {
          .modal { padding: 24px 18px; }
          .modal-actions { flex-direction: column; }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <main className="op-page">
        <div className="cart-pill" onClick={() => router.push('/checkout')}>🛒 <span>View Cart</span></div>

        <div className="hero">
          <div className="hero-ring" /><div className="hero-ring2" />
          <div className="eyebrow">🕉️ पूजा सामग्री</div>
          <h1 className="hero-title">Order <em>Puja</em> Samagri<br />by Ritual</h1>
          <p className="hero-sub">Select your puja or karma kanda — add all items to cart, or book with delivery date.</p>
        </div>

        <div className="filter-tabs">
          {[['all','🙏 All'], ['festival','🎪 Festivals'], ['karma','🕉️ Karma Kanda']].map(([val, label]) => (
            <button key={val} className={`tab-btn${filter === val ? ' active' : ''}`} onClick={() => setFilter(val)}>{label}</button>
          ))}
        </div>

        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          {(filter === 'all' || filter === 'festival') && (
            <>
              {filter === 'all' && <p className="section-label">🎪 Festivals &amp; Parva</p>}
              <div className="pujas-grid">
                {PUJA_SAMAGRI.filter(p => p.type === 'festival').map((puja, i) => (
                  <PujaCard key={puja.id} puja={puja} delay={i * 0.05} total={total(puja)} onView={() => setSelected(puja)} />
                ))}
              </div>
            </>
          )}
          {filter === 'all' && <hr className="section-divider" />}
          {(filter === 'all' || filter === 'karma') && (
            <>
              {filter === 'all' && <p className="section-label">🕉️ Karma Kanda &amp; Sanskar</p>}
              <div className="pujas-grid">
                {PUJA_SAMAGRI.filter(p => p.type === 'karma').map((puja, i) => (
                  <PujaCard key={puja.id} puja={puja} delay={i * 0.05} total={total(puja)} onView={() => setSelected(puja)} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* ── Samagri detail modal ── */}
      {selected && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="modal">
            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            <div className="modal-head">
              <span className="modal-emoji">{selected.emoji}</span>
              <div>
                <h2 className="modal-title">{selected.name}</h2>
                <p className="modal-ne">{selected.nameNe}</p>
              </div>
            </div>
            <p className="modal-desc">{selected.desc}</p>
            <p className="items-label">Required Samagri — {selected.items.length} items</p>
            <div className="items-list">
              {selected.items.map((item, i) => (
                <div key={item.id} className="item-row" style={{ animationDelay: `${i * 0.04}s` }}>
                  <div className="item-dot" />
                  <div className="item-name-block">
                    <div className="item-name">{item.name}</div>
                    <div className="item-name-ne">{item.nameNe}</div>
                  </div>
                  <span className="item-qty">{item.qty} {item.unit}</span>
                  <span className="item-price">Rs. {(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="total-row">
              <div>
                <div className="total-row-label">Kit Total</div>
                <div className="total-row-count">{selected.items.length} items included</div>
              </div>
              <div className="total-row-price">Rs. {total(selected).toLocaleString()}</div>
            </div>
            <div className="modal-actions">
              <button className="add-cart-btn" onClick={() => handleAddToCart(selected)}>🛒 Add to Cart</button>
              <button className="book-btn" onClick={() => openBooking(selected)}>📅 Book Delivery</button>
            </div>
            <p className="modal-note">Free delivery above Rs. 499 · Same day available before 2 PM</p>
          </div>
        </div>
      )}

      {/* ── Booking modal ── */}
      {showBooking && bookingPuja && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setShowBooking(false); }}>
          <div className="modal booking-modal">
            <button className="modal-close" onClick={() => setShowBooking(false)}>✕</button>

            {bookingDone ? (
              <div className="booking-success">
                <span className="big-emoji">🙏</span>
                <h3>Booking Confirmed!</h3>
                <p>
                  Your {bookingPuja.name} booking has been received.<br />
                  We will call you at <strong>{bookingForm.phone}</strong> to confirm.
                </p>
                <div className="dakshina-reminder">
                  🪔 <strong>गुरु दक्षिणा सम्झना गर्नुहोस्</strong><br />
                  पूजा सम्पन्न भएपछि पण्डितजीलाई नगदमा <strong>Rs. {(GURU_FEE[bookingPuja.id] ?? 2100).toLocaleString()}</strong> दक्षिणा दिनुहोला।
                  <br /><span style={{ fontSize: '11px', color: '#a16207' }}>Please keep Rs. {(GURU_FEE[bookingPuja.id] ?? 2100).toLocaleString()} ready in cash to offer the Guru after the puja.</span>
                </div>
                <button className="submit-booking-btn" style={{ marginTop: '20px' }} onClick={() => setShowBooking(false)}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="modal-head">
                  <span className="modal-emoji">{bookingPuja.emoji}</span>
                  <div>
                    <h2 className="modal-title">Book Puja</h2>
                    <p className="modal-ne">{bookingPuja.name} · {bookingPuja.nameNe}</p>
                  </div>
                </div>

                <div className="form-row" style={{ marginTop: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Your Name *</label>
                    <input className="form-input" placeholder="Full name" value={bookingForm.name} onChange={e => setBookingForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input className="form-input" placeholder="98XXXXXXXX" value={bookingForm.phone} onChange={e => setBookingForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Location *</label>
                  <input className="form-input" placeholder="Street, Tole, City" value={bookingForm.location} onChange={e => setBookingForm(p => ({ ...p, location: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Puja Date *</label>
                  <input className="form-input" type="date" value={bookingForm.date} onChange={e => setBookingForm(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Special Instructions</label>
                  <input className="form-input" placeholder="Any notes for the delivery..." value={bookingForm.note} onChange={e => setBookingForm(p => ({ ...p, note: e.target.value }))} />
                </div>

                {/* ── Guru Dakshina Section ── */}
                <div className="dakshina-card">
                  <div className="dakshina-header">
                    <span className="dakshina-diya">🪔</span>
                    <div>
                      <p className="dakshina-title">गुरु दक्षिणा</p>
                      <p className="dakshina-subtitle">Guru Dakshina — paid in person after puja</p>
                    </div>
                  </div>
                  <div className="dakshina-body">
                    <div className="dakshina-rows">
                      <div className="dakshina-row">
                        <span className="dakshina-row-label">Samagri Kit (delivered)</span>
                        <span className="dakshina-row-value muted">Rs. {total(bookingPuja).toLocaleString()}</span>
                      </div>
                      <hr className="dakshina-divider" />
                      <div className="dakshina-row">
                        <span className="dakshina-row-label">गुरु दक्षिणा (नगद / Cash)</span>
                        <span className="dakshina-row-value">Rs. {(GURU_FEE[bookingPuja.id] ?? 2100).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="dakshina-amount-row">
                      <span className="dakshina-amount-label">To pay Guru after puja</span>
                      <span className="dakshina-amount">
                        <span>Rs.</span>{(GURU_FEE[bookingPuja.id] ?? 2100).toLocaleString()}
                      </span>
                    </div>
                    <div className="dakshina-note">
                      <span className="dakshina-note-icon">🙏</span>
                      <span>
                        पूजा सम्पन्न भएपछि पण्डित पुष्कर राज न्यौपानेजीलाई नगदमा दक्षिणा दिनुहोला।
                        यो रकम अनलाइन तिर्न आवश्यक छैन।<br />
                        <span style={{ color: '#78350f', fontSize: '11px' }}>
                          Please keep this amount in cash to offer the Guru once the puja is complete. No online payment needed.
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {bookingError && <div className="booking-error">⚠️ {bookingError}</div>}

                <button className="submit-booking-btn" onClick={handleBooking} disabled={booking}>
                  {booking ? '⏳ Submitting...' : '✓ Confirm Booking'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {added && (
        <div className="toast">✅ {PUJA_SAMAGRI.find(p => p.id === added)?.name} samagri added to cart!</div>
      )}
    </>
  );
}

function PujaCard({ puja, delay, total, onView }) {
  return (
    <div className="puja-card" style={{ animationDelay: `${delay}s` }} onClick={onView}>
      <span className={`type-badge ${puja.type}`}>{TYPE_LABELS[puja.type]}</span>
      <span className="card-emoji">{puja.emoji}</span>
      <h3 className="card-name">{puja.name}</h3>
      <p className="card-name-ne">{puja.nameNe}</p>
      <p className="card-desc">{puja.desc}</p>
      <div className="card-footer">
        <div className="card-total">
          <span className="total-label">Kit Price</span>
          <span className="total-price">Rs. {total.toLocaleString()}</span>
          <span className="total-items">{puja.items.length} items</span>
        </div>
        <button className="view-btn" onClick={e => { e.stopPropagation(); onView(); }}>View Kit →</button>
      </div>
    </div>
  );
}