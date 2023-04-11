# Rig

This is Mike Gravina's attempt at building a domain-general, high-dimensional semantic medium.


## Setup


### Installation

After cloning the site, run `npm i` to install dependencies and `npm run build` to build.


### Setting up the config files

The /static/config folder contains two files in template form (with filenames ending in "_template"). Copy and paste them without the "_template", and modify the resulting config files as needed.

- **config.json**: As of now, this file should remain unmodified from the template. It's a placeholder that will contain information in future releases.

- **serverconfig.json**: This file can be modified to specify the desired ports for the app's main front-end server and its database server (if you need to change these to avoid conflicts with existing port usage). Note that this only applies if you are starting the file as a Windows desktop app using /static/app/start.bat, which is an experimental feature - otherwise ports are set as described below in "Running the application" and "Running the database backend". You can also set the path to the folder where Graph files will be stored.


### Setting up the customizable files

The /static/customizable folder contains two files in template form (with filenames ending in "_template"). Copy and paste them without the "_template", and modify the resulting config files as needed.

- **font-names.json**: This file contains an array of font names that will appear in the font drop-down menu of the Notes editor. Each font name must have a matching entry in notes-style.css (and, by extension, a matching font file in the `fonts` folder), unless you expect the font to already be present on users' systems.

- **notes-style.css**: This file contains CSS font declarations that enable the use of custom fonts in the app. Each entry must have a matching font file in the `fonts` folder, and the `font-family` must match a font name in `font-names.json`.


### Running the application

If you are setting up on a Linux system, we recommend using [pm2](https://pm2.keymetrics.io/) to manage both the the front-end and back-end processes.  
Once pm2 has been installed, copy and paste the file named `pm2_template.config.cjs`, removing the "_template" from the copy. Edit the new file to suit your needs. You will need to supply your domain as "ORIGIN" in order to avoid cross-site errors. You can also change the port that the app runs on if you prefer.
Next, copy and paste the file named `/static/app/start_db_template.sh`, again removing the "_template" from the copy. You can edit this file to change the port that the database back-end runs on if you prefer.
To start both the frontend and backend processes, run `pm2 start pm2.config.cjs` from the base folder of the repository.



## Terminology of a Graph


### Basic building block terminology

* **Thing**: 
A Thing is one of the two basic building blocks of a Graph. When defining a Thing,
we try to respect the "relational" model of representation, which says that Things
have no intrinsic attributes. They are, essentially, "empty". A Thing's attributes,
and more than that, its *identity*, are completely dependent on its Relationships.
With this in mind, a Thing can be described as a vertex in the network of a Graph -
whether that means an endpoint of a single Relationship, or a convergence point of
many Relationships.

* **Relationship**:
A Relationship describes the connection between two Things. Relationships form the
edges of the network of a Graph.
Because Relationships are bidirectional (one can go from the first Thing to the
second Thing, or from the second Thing to the first Thing), they are implemented
in Rig as pairs of relationship entries in the database. Both entries share the
same two endpoint Things, but they differ in terms of the Direction that those
Things are related in. The paired relationship entries always have opposite
Directions to one another.

* **Related Things**: 
Two Things connected by a Relationship are Related Things.

* **Direction**: 
A Direction represents a way that two Things can be related; in other words, a
Direction is a category that Relationships can belong to.

* **Opposite Direction**:
Each Direction has an Opposite Direction; in turn, that Opposite
Direction's own Opposite Direction is the first Direction.

* **Reciprocal Direction**
In rare cases, a Direction can be its own Opposite Direction. A good example is
the root Direction, "is related to", since by definition, if one Thing is related
to a second Thing, then the second Thing is also related to the first). A Direction
that is its own Opposite Direction is called a "Reciprocal Direction".

* **Space**: 
A Space is a set of Directions. (Identical to a set of Axes composed of these
Directions.)


### Graph terminology

* **Unigraph**: A network of Things connected by Relationships, stored as entries in
Rig's relational database.

* **Graph**: A network of Things connected by Relationships that serves to
visualize a bounded part of a Unigraph.

* **Perspective Thing**: The process of building a Graph works outwards from a
single starting Thing. Because the rest of the Graph is built in relation to this
starting Thing, and may depend on this Thing to determine many of its
characteristics, we say that the Graph is built "from the Perspective of" this
Thing, and call this Thing the Perspective Thing of the Graph.

* **Child/Parent Thing (of a Thing)**: After the Perspective Thing, other Things
are added into a Graph as Related Things to a Thing that already exists in the
Graph. Things added this way are called Child Things to the Thing that they are
first related to, and in return, that Thing is called their Parent Thing.

* **Thing Cohort** All Child Things in a single Direction from the Parent Thing. (Note
that if the Parent Thing's own Parent Thing is a Related Thing in that Direction,
the Thing Cohort does *not* include that "grandparent" Thing.)

* **Brood**: All Child Things of a single Parent Thing, regardless of Direction.
(Identical to all Thing Cohorts of a single parent Thing.)

* **Clade**: A Parent Thing, together with its Brood.

* **Parent Thing (of a Clade)**: The Parent Thing of the Clade's central Thing.
(Identical to the "grandparent" Thing of the Clade's peripheral Things.)

* **Generation**: As a Graph is build outward from a Perspective Thing, each
"step" of Relationships is called a Generation. The Perspective Thing itself
is considered Generation "0". All of its immediate Related Things (1 "step"
away from the Perspective Thing) are called Generation 1. Then, when the next
set of Things is added as Related Things from each of the Things in Generation
1, these new Things are called Generation 2, and so on.


### Graph display terminology

* **Axis**: Relationships are shown on one of several display "axes" in the
Graph viewer. These include 1. the vertical and horizontal screen axes; the
perpendicular axis (which emulates depth on the 2-dimensional screen); and
the "encapsulation" axis, which is made up of Things which either enclose
other Things or are enclosed by other Things.

* **Half-Axis**: Each Axis is composed of two opposite Half-Axes. The vertical
Axis is composed of 1 (Down) and 2 (Up). The horizontal Axis is composed of
3 (Right) and 4 (Left). The perpendicular Axis is composed of 5 (Away) and 6
(Towards). The encapsulation Axis is composed of 7 (Inwards) and 8 (Outwards).
When a Clade is displayed in a given Space, one pair of opposite Directions of
that Space is mapped to each Axis. Opposite Directions are generally mapped to
opposite Half-Axes.

* **Relationships Stem**: All of the Relationships for a given Relationship 
Cohort share a source Thing and a Direction, so they're shown in a way that
highlights these shared elements. The parts of all the Relationships closest
to the source Thing are joined together visually into a single "Stem".
Interacting with the Stem allows the user to perform operations on all the
Relationships in the Cohort at the same time.

* **Relationships Fan**: The "Fan" shows the separation of the Relationships
into separate Branches (see below). The diagonal lines of the fan are generally
displayed with a dotted stroke, in order to convey the idea that Relationships
are "orthogonal", i.e. that the non-diagonal lines of the Stem and Branches
represent ends of the true, "broken" line.

* **Relationships Branches**: The parts of the Relationships furthest from the
source Thing are shown as separate "Branches". Interacting with a Branch allows
the user to perform operations on a single Relationship at a time.

* **Portal**: A Clade that is shown with a discrete boundary, separating it from
the surrounding Graph. Generally a Clade is shown as a Portal when it adopts a
different Space from the Clade's Parent Thing, in order to clearly indicate that
Relationships within that Clade are on different axes.


## Layers of the application

* **Atomic models**: These represent basic constructs in the Unigraph. They
inherit the Objection.js `Model` class, and are based on queries of the
database.

* **Graph models**: These represent larger-scale or composite constructs built
up from atomic constructs. 

* **Widget models**: These contain the information necessary to set up
widgets. Each is based on an atomic or graph model (by which it represents an
atomic or graph construct).

* **Widgets**: These are the visual representation of atomic and graph
constructs. They are based on widget model.

* **Viewers**: Viewers are areas of the UI set up to visualize Graphs and
other information. They usually contain widgets.