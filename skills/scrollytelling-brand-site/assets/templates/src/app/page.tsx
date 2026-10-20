import { Preloader } from "@/modules/preloader";
import { Shell } from "@/modules/shell";
import { Hero } from "@/modules/hero";
import { About } from "@/modules/about";
import { Mission } from "@/modules/mission";
import { Process } from "@/modules/process";
import { Capabilities } from "@/modules/capabilities";
import { Works } from "@/modules/works";
import { Industries } from "@/modules/industries";
import { Team } from "@/modules/team";
import { Contact } from "@/modules/contact";
import { Finale } from "@/modules/finale";
import { getContent } from "@/core/content/cms";

/** Re-read the CMS at most once a minute (ISR). */
export const revalidate = 60;

/**
 * Root composition. Order matters: pinned sections create their spacers in
 * DOM order, so ScrollTrigger positions stay correct downstream.
 *
 * CMS content is optional: when it is missing, every module renders the
 * content from its own model.
 */
export default async function Home() {
  const cms = await getContent();

  return (
    <>
      <Preloader />
      <Shell settings={cms?.settings} />
      <main id="main">
        <Hero />
        <About />
        <Mission />
        <Process />
        <Capabilities services={cms?.services} />
        <Works projects={cms?.projects} />
        <Industries industries={cms?.industries} />
        <Team team={cms?.team} />
        <Contact settings={cms?.settings} team={cms?.team} />
      </main>
      <Finale />
    </>
  );
}
