"use client";

import React from 'react';
import NavBar from '../../components/NavBar';

export default function Analysis() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="p-4 bg-gray-900">
        <h1 className="text-4xl font-bold text-center" style={{ fontFamily: 'var(--font-nintendo-ds)' }}>Jungle/DnB Mix Visualizer</h1>
        <NavBar />
      </header>
      
      <main className="flex flex-col flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          
          <section className="mb-8">
            <h3 className="text-2xl font-bold mb-4">Introduction</h3>
            <p className="mb-4">
            &quot;Heavenly Breakcore,&quot; &quot;Atmospheric Jungle,&quot; and &quot;Dreamcast&quot; - these are the names of digital subcultures&apos; evolving soundtracks. I originally sought to research their evolution, but deeper research revealed these aren&apos;t fully evolved genres yet, but microgenres heavily reliant on Jungle/Drum and Bass (DnB) elements.
            </p>
            <p className="mb-4">
            This led me to create an artistic visualization tool to help others new to internet music subgenres understand how modern internet mixes repurpose classic Jungle/DnB elements. Fundamentally, social media facilitated the rise of internet subcultures and their cultivated music, with bedroom DJs inheriting the DIY spirit of UK underground rave culture.
            </p>
          </section>
          
          <section className="mb-8">
            <h3 className="text-2xl font-bold mb-4">The Origins and Foundations of Jungle/DnB</h3>
            <p className="mb-4">
            Jungle is a music genre birthed from underground UK raves - its mothers? The young working-class and immigrant musicians. The genre&apos;s 150-170 bpm songs feature complicated breaks made from sampled music like the 1969 track &quot;Amen, Brother&quot; by the Winstons. (Resident Advisor) DnB evolved out of Jungle in the mid-late 90s. Thus, we can see the same elements as Jungle, but a faster bpm (170-180), simpler breaks (typically 2-step) and an emphasis on bass. Although bass is still present in Jungle music, like reggae and reese, DnB features new bass sounds such as the fog horn car bass. (DXMTHL) An incredibly important feature of both genres is their DIY ethos, born out of Reggae&apos;s sound system culture. Early Jungle and DnB producers built their own record stores, pirate radio stations, dubplate cutting houses and printers which allowed these subculture music genres to flourish outside of the mainstream music industry. Jungle and DnB pioneers primarily used these genres to demonstrate their skills as producers - Goldie invented time stretching which was used to give Jungle music a futuristic, timeless sound. (Resident Advisor)
            </p>
          </section>
          
          <section className="mb-8">
            <h3 className="text-2xl font-bold mb-4">The Internet&apos;s Role</h3>
            <p className="mb-4">
            The internet facilitated the creation of microgenres by making music production accessible. Sites such as SoundCloud provide a platform for users to learn techniques and samples from others. For example, a DJ can comment on a timestamp to ask for the track ID. (Karnik, Mayur, et al) Although the decline of exclusivity is an annoyance for older DJs, it has allowed genre listeners to create their own innovations. Before the internet, subcultures and their music were restricted by &quot;borders, clothing, and sound&quot; - now, &quot;creativity, innovativeness, autonomy and power of the individual cultural producers&quot; lie from even within &quot;the most casual flans&quot; to the &quot;taste-makers and sub-cultural capital producers of the blogosphere.&quot; (Jia, Li) For example, YouTuber christhescientist creates tutorials for internet subgenre music such as &quot;How to Make Playstation Jungle from the 2000s.&quot; (Christhescientist) Millions of such videos break down tracks and teach a global audience how to modify sounds, samples and breakbeats. With such learning tools at their disposal, people who were previously only able to engage by listening, are now able to become subgenre innovators themselves.            
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold mb-4">The Jungle/DnB Sounds of the Internet</h3>
            <p className="mb-4">
            We can use the visualizer to examine how internet subgenres modified Jungle/DnB sounds. The internet facilitated the creation of microgenres by making music production accessible. Sites such as SoundCloud provide a platform for users to learn techniques and samples from others. For example, a DJ can comment on a timestamp to ask for the track ID. (Karnik, Mayur, et al) Although the decline of exclusivity is an annoyance for older DJs, it has allowed genre listeners to create their own innovations. Before the internet, subcultures and their music were restricted by &quot;borders, clothing, and sound&quot; - now, &quot;creativity, innovativeness, autonomy and power of the individual cultural producers&quot; lie from even within &quot;the most casual flans&quot; to the &quot;taste-makers and sub-cultural capital producers of the blogosphere.&quot; (Jia, Li) For example, YouTuber christhescientist creates tutorials for internet subgenre music such as &quot;How to Make Playstation Jungle from the 2000s.&quot; (Christhescientist) Millions of such videos break down tracks and teach a global audience how to modify sounds, samples and breakbeats. With such learning tools at their disposal, people who were previously only able to engage by listening, are now able to become subgenre innovators themselves.
            </p>
            <p className="mb-4">
            For example, there is a foghorn bass loop at about 19:10. DnB expanded Jungle&apos;s characteristic &quot;deep, body-rupturing bass lines&quot; (Resident Advisor) to a &quot;stabbing&quot; bass out of new sources like foghorns.            
            </p>
            <p className="mb-4">
            If we run the sample through Python&apos;s MIDI, we can obtain an array representing the distribution of pitches in the sample, with each index corresponding to a pitch:
            [0.0, 0.0, 0.0, 0.0, 0.7454545454545455, 0.0, 0.0, 0.0, 0.0, 0.2545454545454545, 0.0, 0.0]            
            </p>
            <p className="mb-4">
            An array showing the most common pitches in the sample:
            [4, 9, 11, 10, 8]            
            </p>
            <p className="mb-4">
            And the note density over time, which is the amount of notes played per section in the sample:
            [4, 5, 4, 5, 5, 4, 3, 5, 4, 4, 4, 5, 4, 4, 4, 6]           
            </p>
            <p className="mb-4">
            From this, we can see that there are sparse 3-6 notes per slice, concentrated on pitches 4 (74.5%) and 9 (25.5%). This demonstrates a Jungle bass sound, with the limited pitch range of two main notes, and a DnB bass characteristic, an irregular rhythm pattern.            
            </p>
            <p className="mb-4">
            Another important characteristic of Jungle/DnB are its breakbeats, which are drum patterns sampled from old funk breaks. Breakbeats are characterized by expressive, irregular timing variations which de-emphasize strong beats. (Butler, 78)            
            </p>
            <p className="mb-4">
            The most sampled drum break in history is from &apos;Amen, Brother&apos;. It exploded in popularity in the early 1990s UK Jungle scene when producers would manipulate and pitch up to 150 -170 BPM.            
            </p>
            <p className="mb-4">
            Running this audio through Python&apos;s Librosa, we get an array representing the normalized amplitude or intensity values of the drum hits across 16 evenly-spaced time positions:
            [0.0, 0.560774724133331, 0.10609165208763613, 0.33868341512464034, 1.0, 0.036266776425020165, 0.09692755364371677, 0.5186703449784449, 0.12747916231391482, 0.062482527048594416, 0.08574585066183836, 0.4204578841718032, 0.6962578729712173, 0.1791695114627513, 0.0, 0.0]            
            </p>
            <p className="mb-4">
            The sample has strong beats at 4 (1.0), 12 (0.70), and 1 (0.56), creating an irregular pattern. The result follows Butler&apos;s analysis of the Amen Break, in that there is a subtle hi-hat which is the only instrument an even rhythm, a snare drum hitting strong dynamic accents on beats 2 and 4, the same snare drum hitting weak sixteenth-note beats and a bass drum emphasizing the first beat. (Butler, 78)            
            </p>
            <p className="mb-4">
            As mentioned earlier, free tutorials teach global audiences how to produce internet subgenre music like &quot;90s Playstation Jungle&quot;. The creator, christhescientist, goes over how to transform different Jungle/DnB elements to fit the subgenre&apos;s sound, such as adjusting note velocities, using an Amen break &quot;as a drum fill at the end of the bar&quot;, and modifying samples by adding &quot;an EQ to make room for the bass&quot;. Christhescientist also discusses creating &quot;9th chords&quot;, an element from jazz, to produce emotional and nostalgic samples. Early Jungle/DnB producers also evoked melancholy with unconventional samples such as movie scenes, sirens, and even the 1985 NASA launch. (Resident Advisor)            
            </p>
            <p className="mb-4">
            We can compare sound pads in the visualizer&apos;s internet mix to a soundpad made by christhescientist. We can open the file in Audacity to view its waveform:            
            </p>
            
            <div className="my-6 flex justify-center">
                <img 
                    src="/waveform.png" 
                    alt="Sound pad waveform analysis" 
                    className="max-w-full rounded-lg shadow-lg border border-gray-700"
                    width={600}
                    height={400}
                />
            </div>  
            
            <p className="mb-4">
            The sample has a gradual attack phase that provides a gentler introduction into the sound. After it reaches its peak amplitude, there&apos;s a noticeable, yet slow, decay. The sustained amplitude with natural variations mimics how memories fluctuate in intensity. Finally, the sample&apos;s release is a long, smooth fadeout which dissipates the sound gradually. The gradual attack and release introduce tension that is resolved in a satisfying, yet melancholic way - also the role of 9th chords in jazz.            
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold mb-4">Conclusion</h3>
            <p className="mb-4">
            This analysis demonstrates how the internet democratized the evolution of Jungle/DnB subgenres by teaching musical production of foundational Jungle/DnB elements. These new ways of altering old breaks and creating samples doesn&apos;t just represent musical innovation, but also demonstrates technology&apos;s preservation of musical traditions. If I were to further develop this project, I would analyze more samples and annotate more internet mixes to create an AI model that recognizes these elements to create a more robust, accessible learning tool.            
            </p>
          </section>
          <section className="mb-8">
  <h3 className="text-2xl font-bold mb-4">References</h3>
  
  <div className="mb-6">
    <h4 className="text-xl font-semibold mb-2">YouTube Videos</h4>
    <ul className="list-disc pl-6 space-y-2">
      <li>Resident Advisor. (2024, March 7). What makes something jungle? [Video]. YouTube. <a href="https://www.youtube.com/watch?v=vDZHEAwDAVo" className="text-blue-400 hover:text-blue-300 underline">https://www.youtube.com/watch?v=vDZHEAwDAVo</a></li>
      <li>Christhescientist. (2023, April 27). How to make Playstation Jungle from the 2000s [Video]. YouTube. <a href="https://www.youtube.com/watch?v=bwW245q5668" className="text-blue-400 hover:text-blue-300 underline">https://www.youtube.com/watch?v=bwW245q5668</a></li>
      <li>DXMTHL. (2022, September 24). A beginner&apos;s guide to breakcore, drum &amp; bass, jungle &amp; breakbeat hardcore [Video]. YouTube. <a href="https://www.youtube.com/watch?v=n04zbWo5obA" className="text-blue-400 hover:text-blue-300 underline">https://www.youtube.com/watch?v=n04zbWo5obA</a></li>
    </ul>
  </div>
  
  <div className="mb-6">
    <h4 className="text-xl font-semibold mb-2">Journal Articles</h4>
    <ul className="list-disc pl-6 space-y-2">
      <li>Jia, L. (2022). Subculture in online youth popular music community: Theory and discourse. <i>International Journal of Frontiers in Sociology</i>, 4(7), 101-112. <a href="https://doi.org/10.25236/IJFS.2022.040718" className="text-blue-400 hover:text-blue-300 underline">https://doi.org/10.25236/IJFS.2022.040718</a></li>
      <li>Karnik, M., Cecchinato, M. E., Venturini, T., &amp; Housley, W. (2013). Performing online and offline: How DJs use social networks. <i>Lecture Notes in Computer Science</i>, 8118, 63-80. <a href="https://doi.org/10.1007/978-3-642-40480-1_5" className="text-blue-400 hover:text-blue-300 underline">https://doi.org/10.1007/978-3-642-40480-1_5</a></li>
    </ul>
  </div>
  
  <div className="mb-6">
    <h4 className="text-xl font-semibold mb-2">Books</h4>
    <ul className="list-disc pl-6 space-y-2">
      <li>Butler, M. J. (2006). <i>Unlocking the groove: Rhythm, meter, and musical design in electronic dance music</i>. Indiana University Press.</li>
    </ul>
  </div>
</section>
        </div>
      </main>
      
      <footer className="text-xl bg-gray-900 text-center" style={{ fontFamily: 'var(--font-nintendo-ds)' }}>
        <p>made by Dagny Parayao for DH150</p>
      </footer>
    </div>
  );
}