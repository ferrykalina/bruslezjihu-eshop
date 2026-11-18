import React, { useState, useEffect } from 'react';
import { useCart } from '../lib/CartContext';
import { useAuth } from '../lib/AuthContext';
import { CreditCard, Truck, User, ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function Checkout() {
  const { items, cartTotal, removeItem, serviceSharpen, serviceInsurance } = useCart();
  const { user, isAuthenticated, savedAddresses, addMockOrder } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('CZ');

  // Account creation state (for guest users)
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState('');

  // Shipping & Payment selection
  const [shippingMethod, setShippingMethod] = useState<'dhl' | 'zasilkovna'>('zasilkovna');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card');

  // Checkout steps & simulator
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  // Packeta simulated widget state
  const [selectedBranch, setSelectedBranch] = useState<{ name: string; address: string; zip: string; city: string } | null>(null);
  const [isOpenMap, setIsOpenMap] = useState(false);

  // Express payment state
  const [isExpressPaying, setIsExpressPaying] = useState(false);

  // Alza Gatekeeper state
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const { login, isLoading: authLoading } = useAuth();

  // Pre-fill addresses if user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setEmail(user.email);
      setName(user.name);
      setPhone(user.phone || '');

      // Load default shipping address if exists
      const defaultAddr = savedAddresses.find(a => a.isDefaultShipping) || savedAddresses[0];
      if (defaultAddr) {
        setStreet(defaultAddr.street);
        setCity(defaultAddr.city);
        setZip(defaultAddr.zip);
        setCountry(defaultAddr.country);
      }
    }
  }, [isAuthenticated, user, savedAddresses]);

  const shippingPrice = shippingMethod === 'dhl' ? 120 : 79;
  const servicesTotal = (serviceSharpen ? 199 : 0) + (serviceInsurance ? 99 : 0);
  const finalTotal = cartTotal + shippingPrice + servicesTotal;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    // GoPay/Stripe simulator loading
    await new Promise(resolve => setTimeout(resolve, 1500));

    const generatedOrderNumber = 'OBJ' + Math.floor(100000 + Math.random() * 900000);

    const orderData = {
      orderNumber: generatedOrderNumber,
      totalAmount: finalTotal,
      status: paymentMethod === 'card' ? 'paid' : 'pending',
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        imageUrl: item.imageUrl
      }))
    };

    // Save to user history if logged in
    if (isAuthenticated) {
      addMockOrder(orderData);
    }

    setOrderSuccess(orderData);
    setIsSubmitting(false);

    // Vyčistíme košík po úspěšné objednávce
    items.forEach(item => removeItem(item.id));
  };

  const downloadInvoice = () => {
    if (!orderSuccess) return;
    const invoiceContent = `
=====================================================
            FAKTURA - DAŇOVÝ DOKLAD
=====================================================
Číslo dokladu:   ${orderSuccess.orderNumber}
Datum vystavení: ${new Date().toLocaleDateString('cs-CZ')}
Dodavatel:       Brusle z Jihu s.r.o.
                 IČO: 12345678, DIČ: CZ12345678
                 Krajinská 12, České Budějovice, 370 01
-----------------------------------------------------
Odběratel:       ${name}
E-mail:          ${email}
Telefon:         ${phone}
Doručení na:     ${street}, ${city}, ${zip}, ${country}
-----------------------------------------------------
POLOŽKY OBJEDNÁVKY:
${orderSuccess.items.map((item: any) => `- ${item.name} ${item.size ? `(Velikost: ${item.size})` : ''}\n  Množství: ${item.quantity} ks | Cena: ${item.price.toLocaleString('cs-CZ')} Kč/ks`).join('\n')}
${serviceSharpen ? `- Doplňková služba: První profesionální nabroušení bruslí\n  Množství: 1 ks | Cena: 199 Kč\n` : ''}${serviceInsurance ? `- Doplňková služba: Pojištění proti poškození a rozbití\n  Množství: 1 ks | Cena: 99 Kč\n` : ''}-----------------------------------------------------
Doprava:         ${shippingMethod === 'dhl' ? 'DHL Doručení na adresu' : 'Zásilkovna na výdejní místo'} (${shippingPrice} Kč)
Platba:          ${paymentMethod === 'card' ? 'Online kartou přes GoPay' : 'Bankovní převod'}
-----------------------------------------------------
CELKEM K ÚHRADĚ:  ${orderSuccess.totalAmount.toLocaleString('cs-CZ')} Kč
STAV PLATBY:     ${orderSuccess.status === 'paid' ? 'ZAPLACENO ONLINE' : 'ČEKÁ NA PŘIPSÁNÍ PLATBY'}

Děkujeme za Váš nákup na Brusle z Jihu!
V případě dotazů nás kontaktujte na info@bruslezjihu.cz.
=====================================================
    `;
    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Faktura_${orderSuccess.orderNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (orderSuccess) {
    return (
      <div className="pt-28 pb-32 flex justify-center items-center px-4 bg-muted/10 min-h-screen">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-white border border-border/80 rounded-3xl shadow-xl p-8 md:p-12 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 text-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12" />
            </div>
          </div>

          <h2 className="text-3xl font-bold font-outfit mb-3">Děkujeme za Vaši objednávku!</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            Objednávka <span className="font-bold text-primary">{orderSuccess.orderNumber}</span> byla úspěšně přijata. Potvrzení a fakturu jsme odeslali na Váš e-mail.
          </p>

          <button 
            onClick={downloadInvoice}
            className="mb-8 px-4 py-2 border border-primary/20 text-primary bg-primary/5 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            📥 Stáhnout PDF Fakturu
          </button>

          {/* GoPay QR Code simulation if card payment was selected */}
          {paymentMethod === 'card' ? (
            <div className="bg-emerald-50/50 border border-emerald-200/50 p-6 rounded-2xl mb-8 max-w-md mx-auto">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-2">INTEGRACE GOPAY OK</span>
              <p className="text-sm font-semibold mb-4">Platba kartou proběhla úspěšně přes zabezpečenou bránu GoPay.</p>
              <div className="flex justify-center mb-2">
                <div className="p-3 bg-white border rounded-xl shadow-inner">
                  {/* Mocked QR Code */}
                  <div className="w-36 h-36 bg-slate-200 flex items-center justify-center text-[10px] text-muted-foreground font-mono select-none">
                    [ GOPAY QR KÓD ]
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Pro okamžitou kontrolu platby bankou.</span>
            </div>
          ) : (
            <div className="bg-amber-50/50 border border-amber-200/50 p-6 rounded-2xl mb-8 max-w-md mx-auto">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-2">BANKOVNÍ PŘEVOD</span>
              <p className="text-sm text-foreground leading-relaxed mb-1">Plaťte prosím na účet: <span className="font-bold">123456789/0100</span></p>
              <p className="text-sm text-foreground leading-relaxed mb-3">Variabilní symbol: <span className="font-bold">{orderSuccess.orderNumber.replace(/\D/g, '')}</span></p>
              <span className="text-xs text-muted-foreground">Objednávku odešleme po připsání platby.</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/katalog" 
              className="px-6 py-3 border border-border rounded-xl font-semibold hover:bg-muted/50 transition-colors text-sm"
            >
              Pokračovat v nákupu
            </Link>
            <Link 
              to="/ucet" 
              className="px-6 py-3 premium-gradient text-white font-bold rounded-xl shadow hover:shadow-md transition-all text-sm"
            >
              Sledovat objednávku
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-28 pb-32 flex flex-col justify-center items-center px-4 min-h-screen gap-6 text-center">
        <h2 className="text-2xl font-bold font-outfit">Váš košík je prázdný</h2>
        <p className="text-muted-foreground text-sm max-w-xs">Pro dokončení objednávky vložte nejprve nějaké produkty do košíku.</p>
        <Link 
          to="/katalog" 
          className="premium-gradient text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          Prohlédnout katalog
        </Link>
      </div>
    );
  }

  // Alza.cz Gatekeeper Screen
  if (!isAuthenticated && !isGuestCheckout) {
    return (
      <div className="pt-28 pb-32 flex justify-center items-center px-4 bg-muted/10 min-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl bg-white border border-border/80 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border"
        >
          {/* LEVÁ STRANA: PŘIHLÁŠENÍ */}
          <div className="p-8 md:p-12 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-2">Registrovaný zákazník</span>
              <h2 className="text-2xl font-bold font-outfit mb-3">Přihlásit se k účtu</h2>
              <p className="text-sm text-muted-foreground mb-6">Přihlaste se pro automatické předvyplnění všech adres a platebních metod.</p>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold mb-4 text-center">
                  {authError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">E-mailová adresa</label>
                  <input 
                    type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="email@priklad.cz"
                    className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">Heslo</label>
                  <input 
                    type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••"
                    className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={async () => {
                setAuthError('');
                if (!loginEmail || !loginPassword) {
                  setAuthError('Zadejte prosím e-mail a heslo.');
                  return;
                }
                const success = await login(loginEmail, loginPassword);
                if (!success) {
                  setAuthError('Neplatné přihlašovací údaje.');
                }
              }}
              disabled={authLoading}
              className="w-full premium-gradient text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all mt-8 flex items-center justify-center gap-2"
            >
              {authLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Přihlásit se a pokračovat'}
            </button>
          </div>

          {/* PRAVÁ STRANA: NÁKUP BEZ REGISTRACE */}
          <div className="p-8 md:p-12 bg-muted/10 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Rychlý nákup</span>
              <h2 className="text-2xl font-bold font-outfit mb-3">Nakoupit bez registrace</h2>
              <p className="text-sm text-muted-foreground mb-6">Objednávku můžete dokončit jako host bez nutnosti zakládání účtu.</p>
              
              <ul className="space-y-3 text-xs font-medium text-muted-foreground">
                <li className="flex items-center gap-2">✓ Rychlé vyřízení za 2 minuty</li>
                <li className="flex items-center gap-2">✓ Možnost vytvořit účet dodatečně</li>
                <li className="flex items-center gap-2">✓ 100% zabezpečení a podpora</li>
              </ul>
            </div>

            <button 
              onClick={() => setIsGuestCheckout(true)}
              className="w-full bg-white hover:bg-muted border border-border text-foreground font-bold py-3.5 rounded-xl shadow-sm transition-all mt-8"
            >
              Pokračovat jako host
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-32 max-w-7xl mx-auto px-4 md:px-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link to="/katalog" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Zpět do katalogu
        </Link>
      </div>

      <h1 className="text-3xl font-outfit font-bold mb-10">Dokončení objednávky</h1>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-12">
        
        {/* LEVÝ SLOUPEC: FORMULÁŘE */}
        <div className="space-y-8">
          
          {/* 1. Kontaktní údaje */}
          <div className="bg-white border border-border/80 rounded-2xl p-6 shadow-sm">
            <h2 className="font-outfit font-bold text-lg mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">1</span>
              Kontaktní informace
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground font-bold block mb-1">E-mail *</label>
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="email@priklad.cz"
                  className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:border-primary text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-bold block mb-1">Jméno a příjmení *</label>
                <input 
                  type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Jan Novák"
                  className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:border-primary text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground font-bold block mb-1">Telefonní číslo *</label>
                <input 
                  type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+420 123 456 789"
                  className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:border-primary text-sm"
                />
              </div>
            </div>

            {/* Nabídka registrace pro hosty */}
            {!isAuthenticated && (
              <div className="mt-6 pt-6 border-t border-border/60">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" checked={createAccount} onChange={e => setCreateAccount(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-bold text-foreground">Chci si vytvořit zákaznický účet pro rychlejší nákupy příště</span>
                </label>

                <AnimatePresence>
                  {createAccount && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-4 space-y-2"
                    >
                      <label className="text-xs text-muted-foreground font-bold block mb-1">Zadejte heslo k novému účtu *</label>
                      <input 
                        type="password" required={createAccount} value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimálně 6 znaků"
                        className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:border-primary text-sm"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* 2. Doručovací adresa */}
          <div className="bg-white border border-border/80 rounded-2xl p-6 shadow-sm">
            <h2 className="font-outfit font-bold text-lg mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">2</span>
              Doručovací adresa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground font-bold block mb-1">Ulice a č. popisné *</label>
                <input 
                  type="text" required value={street} onChange={e => setStreet(e.target.value)} placeholder="Hlavní 123"
                  className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:border-primary text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-bold block mb-1">Město *</label>
                <input 
                  type="text" required value={city} onChange={e => setCity(e.target.value)} placeholder="České Budějovice"
                  className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:border-primary text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-bold block mb-1">PSČ *</label>
                <input 
                  type="text" required value={zip} onChange={e => setZip(e.target.value)} placeholder="370 01"
                  className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:border-primary text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground font-bold block mb-1">Země *</label>
                <select 
                  value={country} onChange={e => setCountry(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:border-primary text-sm bg-white"
                >
                  <option value="CZ">Česká Republika</option>
                  <option value="SK">Slovenská Republika</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Doprava a Platba */}
          <div className="bg-white border border-border/80 rounded-2xl p-6 shadow-sm">
            <h2 className="font-outfit font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">3</span>
              Doprava a platba
            </h2>
            
             {/* Doprava */}
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Způsob Doručení</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${
                  shippingMethod === 'zasilkovna' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
                }`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" name="shipping" checked={shippingMethod === 'zasilkovna'} onChange={() => setShippingMethod('zasilkovna')}
                      className="text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="font-bold text-sm block">Zásilkovna</span>
                      <span className="text-xs text-muted-foreground">Na výdejní místo</span>
                    </div>
                  </div>
                  <span className="font-bold text-sm">79 Kč</span>
                </label>

                <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${
                  shippingMethod === 'dhl' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
                }`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" name="shipping" checked={shippingMethod === 'dhl'} onChange={() => setShippingMethod('dhl')}
                      className="text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="font-bold text-sm block">DHL Doručení</span>
                      <span className="text-xs text-muted-foreground">Na Vaši adresu</span>
                    </div>
                  </div>
                  <span className="font-bold text-sm">120 Kč</span>
                </label>
              </div>

              {shippingMethod === 'zasilkovna' && (
                <div className="mt-4 p-4 border border-primary/20 rounded-2xl bg-primary/5 flex flex-col gap-3">
                  <span className="text-xs font-bold text-primary uppercase tracking-wide block">Výběr pobočky</span>
                  {selectedBranch ? (
                    <div className="text-sm">
                      <span className="font-bold block text-foreground">Vybrané výdejní místo:</span>
                      <span className="text-primary font-bold block">{selectedBranch.name}</span>
                      <span className="text-muted-foreground text-xs block">{selectedBranch.address}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Není vybráno žádné výdejní místo.</span>
                  )}
                  <button 
                    type="button"
                    onClick={() => setIsOpenMap(true)}
                    className="px-4 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-1.5 w-fit"
                  >
                    📍 Vybrat výdejní místo na mapě Zásilkovny
                  </button>
                </div>
              )}
            </div>

            {/* Platba */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Způsob Platby</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${
                  paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
                }`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')}
                      className="text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="font-bold text-sm block">Platba Kartou</span>
                      <span className="text-xs text-muted-foreground">Zabezpečeno bránou GoPay</span>
                    </div>
                  </div>
                  <span className="p-1 bg-white border rounded"><CreditCard className="w-5 h-5 text-primary" /></span>
                </label>

                <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${
                  paymentMethod === 'transfer' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
                }`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" name="payment" checked={paymentMethod === 'transfer'} onChange={() => setPaymentMethod('transfer')}
                      className="text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="font-bold text-sm block">Bankovní převod</span>
                      <span className="text-xs text-muted-foreground">Odeslání po obdržení platby</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

          </div>

        </div>

        {/* PRAVÝ SLOUPEC: SHRNUTÍ KOŠÍKU */}
        <div className="space-y-6">
          <div className="bg-white border border-border/80 rounded-2xl p-6 shadow-sm sticky top-28">
            <h2 className="font-outfit font-bold text-lg mb-6">Shrnutí objednávky</h2>
            
            {/* Položky */}
            <div className="divide-y divide-border/60 max-h-72 overflow-y-auto mb-6 pr-2">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center">
                  <div className="w-12 h-12 bg-white border rounded-lg p-1 shrink-0 flex items-center justify-center">
                    <img src={item.imageUrl} alt={item.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-xs block truncate">{item.name}</span>
                    {item.size && <span className="text-[10px] text-muted-foreground block">Velikost: {item.size}</span>}
                    <span className="text-xs text-muted-foreground">{item.quantity} ks</span>
                  </div>
                  <span className="font-bold text-xs shrink-0">{item.price.toLocaleString('cs-CZ')} Kč</span>
                </div>
              ))}
            </div>

            <hr className="border-border/80 mb-6" />

            {/* Mezisoučet & doprava */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Položky</span>
                <span>{cartTotal.toLocaleString('cs-CZ')} Kč</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Doprava</span>
                <span>{shippingPrice} Kč</span>
              </div>
              {serviceSharpen && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>⛸️ Nabroušení bruslí</span>
                  <span>199 Kč</span>
                </div>
              )}
              {serviceInsurance && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>🛡️ Pojištění proti rozbití</span>
                  <span>99 Kč</span>
                </div>
              )}
              <hr className="border-border/60" />
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold">Celkem k úhradě</span>
                <span className="font-bold text-xl text-primary">{finalTotal.toLocaleString('cs-CZ')} Kč</span>
              </div>
            </div>

            {/* EXPRESNÍ PLATBA (APPLE PAY / GOOGLE PAY) */}
            <div className="mb-4 space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block text-center">Expresní nákup na 1 kliknutí</span>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={async () => {
                    setIsExpressPaying(true);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    setIsExpressPaying(false);
                    // simulated success
                    setOrderSuccess({
                      orderNumber: 'OBJ' + Math.floor(100000 + Math.random() * 900000),
                      totalAmount: finalTotal,
                      status: 'paid',
                      items: items.map(item => ({ ...item, quantity: item.quantity }))
                    });
                    items.forEach(item => removeItem(item.id));
                  }}
                  className="w-full h-11 bg-black text-white hover:bg-black/90 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all text-sm shadow-sm"
                >
                   Pay
                </button>
                <button 
                  type="button"
                  onClick={async () => {
                    setIsExpressPaying(true);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    setIsExpressPaying(false);
                    // simulated success
                    setOrderSuccess({
                      orderNumber: 'OBJ' + Math.floor(100000 + Math.random() * 900000),
                      totalAmount: finalTotal,
                      status: 'paid',
                      items: items.map(item => ({ ...item, quantity: item.quantity }))
                    });
                    items.forEach(item => removeItem(item.id));
                  }}
                  className="w-full h-11 bg-white hover:bg-slate-50 border border-border text-foreground font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all text-sm shadow-sm font-sans"
                >
                  <span className="font-bold text-red-500">G</span>
                  <span className="font-bold text-blue-500">o</span>
                  <span className="font-bold text-amber-500">o</span>
                  <span className="font-bold text-green-500">g</span>
                  <span className="font-semibold text-slate-700">le Pay</span>
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full premium-gradient text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : paymentMethod === 'card' ? (
                <>Zaplatit přes GoPay ({finalTotal.toLocaleString('cs-CZ')} Kč)</>
              ) : (
                <>Dokončit objednávku ({finalTotal.toLocaleString('cs-CZ')} Kč)</>
              )}
            </button>

            <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground mt-4">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Bezpečná šifrovaná platba GoPay.
            </div>
          </div>
        </div>

      </form>

      {/* PACKETA MAP WIDGET SIMULATION MODAL */}
      <AnimatePresence>
        {isOpenMap && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpenMap(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[200]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white border border-border shadow-2xl rounded-3xl z-[210] p-6 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                  <h3 className="font-outfit font-bold text-xl flex items-center gap-2">
                    <span className="text-red-500">📍</span> Zásilkovna - Výběr výdejního místa
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Vyberte si pobočku nebo box v Českých Budějovicích a okolí.</p>
                </div>
                <button 
                  onClick={() => setIsOpenMap(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Simulated branch list */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-6">
                {[
                  { name: 'AlzaBox České Budějovice - Krajinská', address: 'Krajinská 12, 370 01 České Budějovice', zip: '370 01', city: 'České Budějovice' },
                  { name: 'Z-BOX České Budějovice - Hlavní Nádraží', address: 'Nádražní 120, 370 01 České Budějovice', zip: '370 01', city: 'České Budějovice' },
                  { name: 'Hokej Sport - Výdejní místo', address: 'Lidická 45, 370 01 České Budějovice', zip: '370 01', city: 'České Budějovice' },
                  { name: 'Zásilkovna - Potraviny Večerka', address: 'Pražská 88, 370 04 České Budějovice', zip: '370 04', city: 'České Budějovice' }
                ].map((branch, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      setSelectedBranch(branch);
                      setStreet(branch.name);
                      setCity(branch.city);
                      setZip(branch.zip);
                      setIsOpenMap(false);
                    }}
                    className="p-4 border border-border hover:border-primary hover:bg-primary/5 rounded-2xl cursor-pointer transition-all flex justify-between items-center group"
                  >
                    <div>
                      <span className="font-bold text-sm block group-hover:text-primary transition-colors">{branch.name}</span>
                      <span className="text-xs text-muted-foreground">{branch.address}</span>
                    </div>
                    <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">Zvolit ➔</span>
                  </div>
                ))}
              </div>

              <div className="text-center text-xs text-muted-foreground pt-4 border-t">
                Packeta Widget v.5.0 - Brusle z Jihu Integration
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* EXPRESS PAYING MODAL */}
      <AnimatePresence>
        {isExpressPaying && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-[300] flex flex-col items-center justify-center gap-4 text-white"
          >
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-lg font-bold font-outfit">Zabezpečené expresní placení...</span>
            <p className="text-xs text-white/70">Potvrďte prosím platbu na svém zařízení</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
