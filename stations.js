/* =====================================================================
   BEHIND THE FACADE · CONTENT FILE
   ---------------------------------------------------------------------
   This is the only file you need to edit to change texts, photos,
   stations, stamps and the map. Everything else reads from here.

   Rules of thumb
   - Text goes between "quotes". If your text contains a " use \" instead.
   - Every entry in a list ends with a comma.
   - After saving, reload the page. If the page stays empty, you most
     likely broke a comma or a quote: open the browser console (F12)
     and it tells you the line number.
   - The full explanation with examples is on the page itself:
     open  index.html#guide
   ===================================================================== */


/* ---------------------------------------------------------------------
   1. GENERAL SETTINGS
   --------------------------------------------------------------------- */
const SITE = {
  // Name of the trail, shown at the top of every page.
  title: "Behind the Facade",

  // Small line above the title on the passport page.
  place: "A campus trail · Im Neuenheimer Feld, Heidelberg",

  // One or two sentences under the title on the passport page.
  intro: "Six exhibits in four physics buildings. Scan the QR code next to each one, find out what it shows, and collect its stamp in your passport.",

  // The public address of the website once it is online, ending in "/".
  // Example: "https://our-group.github.io/behind-the-facade/"
  // The QR codes are made from this address plus "#" plus the station id.
  // Leave it empty while you are still testing.
  url: "https://git-jac-wer.github.io/behind-the-facade/",

  // Text on the passport cover.
  passportName: "Research passport",

  // Shown when every stamp has been collected.
  completeText: "Passport complete. You have looked behind all six facades.",

  // Optional: a picture of the real floor plan, e.g. "images/floorplan.png".
  // Leave empty to use the simple drawn map. Positions on the map are given
  // in "map" below as x (0 = left, 100 = right) and y (0 = top, 70 = bottom).
  floorplan: "",
};


/* ---------------------------------------------------------------------
   2. BUILDINGS
   Each building groups one or more stations.
   id       short name used by the stations below (lowercase, no spaces)
   code     short name printed on stamps and the map
   address  street address on campus
   name     full name of the institute
   map      where the building sits on the drawn map:
            x, y = top-left corner, w = width, h = height
   --------------------------------------------------------------------- */
const BUILDINGS = [
  { id: "imseam", code: "IMSEAM", address: "INF 225",  name: "Institute for Molecular Systems Engineering and Advanced Materials", map: { x: 6,  y: 8,  w: 38, h: 22 } },
  { id: "einc",   code: "EINC",   address: "INF 225a", name: "European Institute for Neuromorphic Computing",                     map: { x: 56, y: 8,  w: 38, h: 22 } },
  { id: "pi",     code: "PI",     address: "INF 226",  name: "Physikalisches Institut",                                           map: { x: 6,  y: 40, w: 38, h: 22 } },
  { id: "kip",    code: "KIP",    address: "INF 227",  name: "Kirchhoff-Institut für Physik",                                     map: { x: 56, y: 40, w: 38, h: 22 } },
];


/* ---------------------------------------------------------------------
   3. STATIONS
   One block per exhibit. The order here is the order of the route.

   id        the name in the QR link: website-address#id
             lowercase letters, digits and hyphens only.
             NEVER change it after the QR codes are printed.
   building  the id of a building from the list above
   title     headline on the station page
   teaser    one line shown under the title and on the map list
   draft     true shows a small "draft text" label on the page
   photos    list of photos; tapping the photo shows the next one.
             src = file in the images folder, caption = text under it
   sections  the explanation, as blocks of heading + text.
             An empty line inside text ("\n\n") starts a new paragraph.
   quiz      optional. If present, visitors answer it before they can
             collect the stamp. answer = number of the correct option,
             counting from 0. explain = shown after answering.
   widget    optional interactive add-on from widgets.js
   stamp     how the stamp looks (see the guide page for a gallery):
             shape  "circle", "hexagon", "square" or "ticket"
             ink    colour of the stamp ink
             icon   "pendulum", "field", "detector", "prism",
                    "neuron", "printer" or "star"
             label  big word on the stamp (keep it short)
             image  optional: your own stamp picture, e.g.
                    "images/stamps/pendulum.png". Replaces the drawn stamp.
   map       position of the station dot on the map (x 0–100, y 0–70)
   --------------------------------------------------------------------- */
const STATIONS = [
  {
    id: "pendulum",
    building: "kip",
    title: "Foucault's pendulum",
    teaser: "A brass ball that proves the Earth is turning.",
    draft: true,
    photos: [
      { src: "images/pendulum-1.jpg", caption: "The ball swings over a ring of small pins." },
      { src: "images/pendulum-2.jpg", caption: "A moment later, on the other side of its swing." },
    ],
    sections: [
      { heading: "What you see",
        text: "A heavy brass ball hangs from a long wire and swings back and forth over a ring of small pins. Over the day the pins fall over one by one, although nobody pushes the pendulum sideways." },
      { heading: "What is going on",
        text: "The pendulum keeps swinging in the same direction in space. It is the Earth, with the floor and the pins on it, that turns underneath.\n\nIn Heidelberg the swing seems to turn by about 11 degrees per hour, clockwise seen from above. Léon Foucault first showed this in Paris in 1851." },
    ],
    widget: { type: "pendulumTimeline", pins: 48, latitude: 49.41 },
    stamp: { shape: "circle", ink: "#2447a6", icon: "pendulum", label: "Pendulum" },
    map: { x: 66, y: 52 },
  },

  {
    id: "vector-wall",
    building: "kip",
    title: "The arrow wall",
    teaser: "Dozens of little arrows, sometimes in order, sometimes not.",
    draft: true,
    photos: [
      { src: "images/vector-wall-ordered.jpg", caption: "Ordered: the arrows follow one pattern." },
      { src: "images/vector-wall-random.jpg",  caption: "Disordered: every arrow points its own way." },
    ],
    sections: [
      { heading: "What you see",
        text: "Metal arrows sit on a glass pane, each free to turn. Sometimes they form neat swirls, sometimes they point in every direction." },
      { heading: "What it could stand for",
        text: "Physicists draw arrows like these for fields, and for the tiny magnets (spins) inside atoms. When the spins in a material line up, the material is a magnet. When heat jumbles them, the magnetism is gone.\n\n[To check: what the exhibit is meant to show. Ask at the KIP.]" },
    ],
    stamp: { shape: "hexagon", ink: "#1f7a55", icon: "field", label: "Arrows" },
    map: { x: 84, y: 54 },
  },

  {
    id: "alice",
    building: "pi",
    title: "ALICE: a detector for the primordial soup",
    teaser: "A cut-open model of one of the big detectors at CERN.",
    draft: true,
    photos: [
      { src: "images/alice-model.jpg",  caption: "Scale model of the ALICE detector. The numbers mark its parts." },
      { src: "images/alice-poster.jpg", caption: "The poster next to it: parts of ALICE built and tested in Heidelberg." },
    ],
    sections: [
      { heading: "What you see",
        text: "A cut-open scale model of ALICE, one of the four large detectors at CERN's Large Hadron Collider near Geneva. The real detector is as tall as a five-storey house." },
      { heading: "What it is for",
        text: "At the collider, lead nuclei crash into each other. For a tiny moment they form a quark-gluon plasma, the hot 'primordial soup' that filled the universe a few microseconds after the Big Bang. ALICE tracks the thousands of particles that fly out of each collision.\n\nThe poster shows parts of the detector that were tested and assembled in Heidelberg." },
    ],
    quiz: {
      question: "How heavy is the real ALICE detector?",
      options: ["About 10 tonnes", "About 1,000 tonnes", "About 10,000 tonnes", "About 100,000 tonnes"],
      answer: 2,
      explain: "About 10,000 tonnes, roughly as heavy as the Eiffel Tower. It is 26 m long, 16 m high and 16 m wide.",
    },
    stamp: { shape: "square", ink: "#b0262c", icon: "detector", label: "ALICE" },
    map: { x: 16, y: 52 },
  },

  {
    id: "spectroscope",
    building: "pi",
    title: "Kirchhoff and Bunsen's spectroscope",
    teaser: "The instrument that reads the fingerprints of light.",
    draft: true,
    photos: [
      { src: "images/spectroscope.jpg",      caption: "Prism, telescopes and a small burner." },
      { src: "images/spectroscope-case.jpg", caption: "More historic instruments in the display case." },
    ],
    sections: [
      { heading: "What you see",
        text: "A wooden box with a glass prism and brass telescopes, next to a small gas burner. Around 1860, Gustav Kirchhoff and Robert Bunsen used an instrument like this here in Heidelberg." },
      { heading: "Fingerprints of light",
        text: "Put a substance into the flame and the prism splits its light into colours. Every chemical element glows in its own pattern of coloured lines. This way the two discovered new elements: caesium and rubidium.\n\nThe same idea is still used today. The DOAS telescope in this building sends light across Heidelberg and reads the gases in the air from the colours that are missing. Kirchhoff's bust stands next door, in the institute named after him." },
    ],
    stamp: { shape: "circle", ink: "#6a3e9e", icon: "prism", label: "Spectrum" },
    map: { x: 34, y: 54 },
  },

  {
    id: "neurons",
    building: "einc",
    title: "A glowing piece of brain",
    teaser: "Model nerve cells that flash like the real ones signal.",
    draft: true,
    photos: [
      { src: "images/neurons-1.jpg", caption: "Branching nerve cells, printed in white." },
      { src: "images/neurons-2.jpg", caption: "The lights change from moment to moment." },
      { src: "images/neurons-3.jpg", caption: "Each flash stands for a signal." },
    ],
    sections: [
      { heading: "What you see",
        text: "A clear cylinder full of white, branching shapes. Each one is a model of a nerve cell (a neuron), and small lights flash on and off between them." },
      { heading: "What is going on",
        text: "The flashes stand for the short electrical pulses, called spikes, that neurons use to talk to each other. At the EINC, researchers build computer chips that work with spikes too. Heidelberg's BrainScaleS chips run such networks about a thousand times faster than a real brain." },
      { heading: "Did you know?",
        text: "The fastest signals in your nerves travel at about 100 metres per second. Light is about three million times faster." },
    ],
    stamp: { shape: "ticket", ink: "#c0306f", icon: "neuron", label: "Neurons" },
    map: { x: 75, y: 20 },
  },

  {
    id: "printer",
    building: "imseam",
    title: "Printing matter to order",
    teaser: "From a desktop 3D printer to structures smaller than a hair.",
    draft: true,
    photos: [
      { src: "images/printer.jpg", caption: "A desktop 3D printer with plastic filament." },
    ],
    sections: [
      { heading: "What you see",
        text: "A desktop 3D printer. It melts a plastic wire and builds an object layer by layer, each layer a fraction of a millimetre thick." },
      { heading: "The research",
        text: "Researchers from Heidelberg and Karlsruhe (KIT) print much smaller things. A focused laser beam hardens a liquid only at its focus point, so they can draw structures finer than a thousandth of a millimetre, for example new materials and tiny optics.\n\n[To check: which building the exhibit is in, and the details of the research.]" },
    ],
    stamp: { shape: "hexagon", ink: "#b5561b", icon: "printer", label: "3D Print" },
    map: { x: 25, y: 20 },
  },
];
