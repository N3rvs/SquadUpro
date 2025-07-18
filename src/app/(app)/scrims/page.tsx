// src/app/(app)/scrims/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot, orderBy, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Scrim } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { useI18n } from '@/contexts/i18n-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, CalendarSearch, BookOpen, ShieldCheck } from 'lucide-react';
import { CreateScrimDialog } from '@/components/scrims/create-scrim-dialog';
import { ScrimCard } from '@/components/scrims/scrim-card';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getFlagEmoji } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function ScrimList({ scrims, loading }: { scrims: Scrim[], loading: boolean }) {
    const { t } = useI18n();
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
            </div>
        );
    }

    if (scrims.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center h-[400px]">
                <Flame className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">{t('ScrimsPage.no_scrims_title')}</h3>
                <p className="mb-4 mt-2 text-sm text-muted-foreground">
                    {t('ScrimsPage.no_scrims_subtitle')}
                </p>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {scrims.map(scrim => (
                <ScrimCard key={scrim.id} scrim={scrim} />
            ))}
        </div>
    );
}

export default function ScrimsPage() {
  const { userProfile } = useAuth();
  const { t } = useI18n();
  const [availableScrims, setAvailableScrims] = useState<Scrim[]>([]);
  const [myScrims, setMyScrims] = useState<Scrim[]>([]);
  const [confirmedScrims, setConfirmedScrims] = useState<Scrim[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [loadingMyScrims, setLoadingMyScrims] = useState(true);
  const [loadingConfirmed, setLoadingConfirmed] = useState(true);

  const [rankFilter, setRankFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');

  const canCreate = userProfile?.teamId && (userProfile.role === 'founder' || userProfile.role === 'coach');

  const rankOrder: { [key: string]: number } = {
    'Hierro': 1, 'Iron': 1,
    'Bronce': 2, 'Bronze': 2,
    'Plata': 3, 'Silver': 3,
    'Oro': 4, 'Gold': 4,
    'Platino': 5, 'Platinum': 5,
    'Diamante': 6, 'Diamond': 6,
    'Ascendente': 7, 'Ascendant': 7,
    'Inmortal': 8, 'Immortal': 8,
    'Radiante': 9, 'Radiant': 9,
  };

  const valorantRanks = [
    { value: 'all', label: t('Market.all_ranks') },
    { value: 'Hierro', label: t('Ranks.iron') },
    { value: 'Bronce', label: t('Ranks.bronze') },
    { value: 'Plata', label: t('Ranks.silver') },
    { value: 'Oro', label: t('Ranks.gold') },
    { value: 'Platino', label: t('Ranks.platinum') },
    { value: 'Diamante', label: t('Ranks.diamond') },
    { value: 'Ascendente', label: t('Ranks.ascendant') },
    { value: 'Inmortal', label: t('Ranks.immortal') },
    { value: 'Radiante', label: t('Ranks.radiant') },
  ];

  const europeanCountries = [
    { value: 'all', label: t('Market.all_countries') },
    { value: 'Albania', label: `${getFlagEmoji('Albania')} ${t('Countries.albania')}` },
    { value: 'Andorra', label: `${getFlagEmoji('Andorra')} ${t('Countries.andorra')}` },
    { value: 'Austria', label: `${getFlagEmoji('Austria')} ${t('Countries.austria')}` },
    { value: 'Belarus', label: `${getFlagEmoji('Belarus')} ${t('Countries.belarus')}` },
    { value: 'Belgium', label: `${getFlagEmoji('Belgium')} ${t('Countries.belgium')}` },
    { value: 'Bosnia and Herzegovina', label: `${getFlagEmoji('Bosnia and Herzegovina')} ${t('Countries.bosnia_and_herzegovina')}` },
    { value: 'Bulgaria', label: `${getFlagEmoji('Bulgaria')} ${t('Countries.bulgaria')}` },
    { value: 'Croatia', label: `${getFlagEmoji('Croatia')} ${t('Countries.croatia')}` },
    { value: 'Cyprus', label: `${getFlagEmoji('Cyprus')} ${t('Countries.cyprus')}` },
    { value: 'Czech Republic', label: `${getFlagEmoji('Czech Republic')} ${t('Countries.czech_republic')}` },
    { value: 'Denmark', label: `${getFlagEmoji('Denmark')} ${t('Countries.denmark')}` },
    { value: 'Estonia', label: `${getFlagEmoji('Estonia')} ${t('Countries.estonia')}` },
    { value: 'Finland', label: `${getFlagEmoji('Finland')} ${t('Countries.finland')}` },
    { value: 'France', label: `${getFlagEmoji('France')} ${t('Countries.france')}` },
    { value: 'Germany', label: `${getFlagEmoji('Germany')} ${t('Countries.germany')}` },
    { value: 'Greece', label: `${getFlagEmoji('Greece')} ${t('Countries.greece')}` },
    { value: 'Hungary', label: `${getFlagEmoji('Hungary')} ${t('Countries.hungary')}` },
    { value: 'Iceland', label: `${getFlagEmoji('Iceland')} ${t('Countries.iceland')}` },
    { value: 'Ireland', label: `${getFlagEmoji('Ireland')} ${t('Countries.ireland')}` },
    { value: 'Italy', label: `${getFlagEmoji('Italy')} ${t('Countries.italy')}` },
    { value: 'Latvia', label: `${getFlagEmoji('Latvia')} ${t('Countries.latvia')}` },
    { value: 'Liechtenstein', label: `${getFlagEmoji('Liechtenstein')} ${t('Countries.liechtenstein')}` },
    { value: 'Lithuania', label: `${getFlagEmoji('Lithuania')} ${t('Countries.lithuania')}` },
    { value: 'Luxembourg', label: `${getFlagEmoji('Luxembourg')} ${t('Countries.luxembourg')}` },
    { value: 'Malta', label: `${getFlagEmoji('Malta')} ${t('Countries.malta')}` },
    { value: 'Moldova', label: `${getFlagEmoji('Moldova')} ${t('Countries.moldova')}` },
    { value: 'Monaco', label: `${getFlagEmoji('Monaco')} ${t('Countries.monaco')}` },
    { value: 'Montenegro', label: `${getFlagEmoji('Montenegro')} ${t('Countries.montenegro')}` },
    { value: 'Netherlands', label: `${getFlagEmoji('Netherlands')} ${t('Countries.netherlands')}` },
    { value: 'North Macedonia', label: `${getFlagEmoji('North Macedonia')} ${t('Countries.north_macedonia')}` },
    { value: 'Norway', label: `${getFlagEmoji('Norway')} ${t('Countries.norway')}` },
    { value: 'Poland', label: `${getFlagEmoji('Poland')} ${t('Countries.poland')}` },
    { value: 'Portugal', label: `${getFlagEmoji('Portugal')} ${t('Countries.portugal')}` },
    { value: 'Romania', label: `${getFlagEmoji('Romania')} ${t('Countries.romania')}` },
    { value: 'Russia', label: `${getFlagEmoji('Russia')} ${t('Countries.russia')}` },
    { value: 'San Marino', label: `${getFlagEmoji('San Marino')} ${t('Countries.san_marino')}` },
    { value: 'Serbia', label: `${getFlagEmoji('Serbia')} ${t('Countries.serbia')}` },
    { value: 'Slovakia', label: `${getFlagEmoji('Slovakia')} ${t('Countries.slovakia')}` },
    { value: 'Slovenia', label: `${getFlagEmoji('Slovenia')} ${t('Countries.slovenia')}` },
    { value: 'Spain', label: `${getFlagEmoji('Spain')} ${t('Countries.spain')}` },
    { value: 'Sweden', label: `${getFlagEmoji('Sweden')} ${t('Countries.sweden')}` },
    { value: 'Switzerland', label: `${getFlagEmoji('Switzerland')} ${t('Countries.switzerland')}` },
    { value: 'Ukraine', label: `${getFlagEmoji('Ukraine')} ${t('Countries.ukraine')}` },
    { value: 'United Kingdom', label: `${getFlagEmoji('United Kingdom')} ${t('Countries.united_kingdom')}` },
    { value: 'Vatican City', label: `${getFlagEmoji('Vatican City')} ${t('Countries.vatican_city')}` }
  ];

  // Fetch available scrims (status: open)
  useEffect(() => {
    const q = query(
      collection(db, 'scrims'),
      where('status', '==', 'open'),
      orderBy('date', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scrim));
      setAvailableScrims(data);
      setLoadingAvailable(false);
    }, (error) => {
      console.error("Error fetching available scrims:", error);
      setLoadingAvailable(false);
    });

    return () => unsubscribe();
  }, []);

   // Fetch user's scrims 
  useEffect(() => {
    if (!userProfile?.teamId) {
        setLoadingMyScrims(false);
        setMyScrims([]);
        return;
    }
    setLoadingMyScrims(true);
    const teamId = userProfile.teamId;
    
    // Firestore does not support logical OR queries on different fields.
    // We must perform separate queries and merge the results.
    const q1 = query(collection(db, 'scrims'), where('teamAId', '==', teamId));
    const q2 = query(collection(db, 'scrims'), where('teamBId', '==', teamId));
    const q3 = query(collection(db, 'scrims'), where('challengerId', '==', teamId));
    
    let scrims1: Scrim[] = [], scrims2: Scrim[] = [], scrims3: Scrim[] = [];
    let unsub1: Unsubscribe, unsub2: Unsubscribe, unsub3: Unsubscribe;

    const combineAndSetResults = () => {
        const allScrims = [...scrims1, ...scrims2, ...scrims3];
        const uniqueScrims = Array.from(new Map(allScrims.map(item => [item.id, item])).values());
        const sortedScrims = uniqueScrims
            .filter(s => s.status !== 'open')
            .sort((a,b) => b.date.toMillis() - a.date.toMillis());
        setMyScrims(sortedScrims);
        setLoadingMyScrims(false);
    }

    unsub1 = onSnapshot(q1, (snap) => { scrims1 = snap.docs.map(doc => ({id: doc.id, ...doc.data()}) as Scrim); combineAndSetResults(); });
    unsub2 = onSnapshot(q2, (snap) => { scrims2 = snap.docs.map(doc => ({id: doc.id, ...doc.data()}) as Scrim); combineAndSetResults(); });
    unsub3 = onSnapshot(q3, (snap) => { scrims3 = snap.docs.map(doc => ({id: doc.id, ...doc.data()}) as Scrim); combineAndSetResults(); });

    return () => {
        if(unsub1) unsub1();
        if(unsub2) unsub2();
        if(unsub3) unsub3();
    };
  }, [userProfile?.teamId]);

  // Fetch all confirmed scrims
  useEffect(() => {
    const q = query(
      collection(db, 'scrims'),
      where('status', '==', 'confirmed'),
      orderBy('date', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scrim));
      setConfirmedScrims(data);
      setLoadingConfirmed(false);
    }, (error) => {
      console.error("Error fetching confirmed scrims:", error);
      setLoadingConfirmed(false);
    });

    return () => unsubscribe();
  }, []);

  const handleResetFilters = () => {
    setRankFilter('all');
    setCountryFilter('all');
  };
  
  const applyFilters = (scrims: Scrim[]) => {
      return scrims.filter(scrim => {
      const countryMatch = countryFilter === 'all' || scrim.country === countryFilter;
      const rankMatch = rankFilter === 'all' || 
        (!scrim.rankMin && !scrim.rankMax) ||
        (scrim.rankMin && scrim.rankMax && rankOrder[rankFilter] >= rankOrder[scrim.rankMin] && rankOrder[rankFilter] <= rankOrder[scrim.rankMax]);
      return countryMatch && rankMatch;
    });
  }

  const filteredAvailableScrims = useMemo(() => applyFilters(availableScrims), [availableScrims, rankFilter, countryFilter]);
  const filteredConfirmedScrims = useMemo(() => applyFilters(confirmedScrims), [confirmedScrims, rankFilter, countryFilter]);


  const filterCard = (
    <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
                <Label htmlFor="rank-filter">{t('Market.rank_filter_label')}</Label>
                <Select value={rankFilter} onValueChange={setRankFilter}>
                    <SelectTrigger id="rank-filter" className="mt-1">
                        <SelectValue placeholder={t('Market.all_ranks')} />
                    </SelectTrigger>
                    <SelectContent>
                        {valorantRanks.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="country-filter">{t('Market.country_filter_label')}</Label>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                    <SelectTrigger id="country-filter" className="mt-1">
                        <SelectValue placeholder={t('Market.all_countries')} />
                    </SelectTrigger>
                    <SelectContent>
                        {europeanCountries.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-end gap-2">
                <Button variant="ghost" onClick={handleResetFilters} className="w-full md:w-auto">{t('Market.reset_button')}</Button>
            </div>
        </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">{t('ScrimsPage.title')}</h1>
          <p className="text-muted-foreground">{t('ScrimsPage.subtitle')}</p>
        </div>
        {canCreate && <CreateScrimDialog teamId={userProfile.teamId!} />}
      </div>
      
       <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available"><CalendarSearch className="mr-2 h-4 w-4" /> {t('ScrimsPage.available_scrims_tab')}</TabsTrigger>
            <TabsTrigger value="my-scrims"><BookOpen className="mr-2 h-4 w-4" /> {t('ScrimsPage.my_scrims_tab')}</TabsTrigger>
            <TabsTrigger value="confirmed"><ShieldCheck className="mr-2 h-4 w-4" /> {t('ScrimsPage.confirmed_matches_tab')}</TabsTrigger>
        </TabsList>
        <TabsContent value="available" className="mt-6">
            {filterCard}
            <ScrimList scrims={filteredAvailableScrims} loading={loadingAvailable} />
        </TabsContent>
        <TabsContent value="my-scrims" className="mt-6">
            <ScrimList scrims={myScrims} loading={loadingMyScrims} />
        </TabsContent>
         <TabsContent value="confirmed" className="mt-6">
            {filterCard}
            <ScrimList scrims={filteredConfirmedScrims} loading={loadingConfirmed} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
