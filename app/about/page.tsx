import { BookOpen, Users, Church } from "lucide-react";

const features = [
  {
    id: "feature-1",
    title: "Community-Driven Knowledge",
    description:
      "Our platform brings together faithful members, scholars, and clergy to share authentic knowledge about the Ethiopian Orthodox Tewahedo Church traditions and practices.",
    icon: Users,
  },
  {
    id: "feature-2",
    title: "Authentic Information",
    description:
      "All answers are rooted in the teachings of the Ethiopian Orthodox Tewahedo Church, providing reliable information that respects our ancient traditions and canonical texts.",
    icon: BookOpen,
  },
  {
    id: "feature-3",
    title: "Spiritual Growth",
    description:
      "Beyond just answers, we aim to foster spiritual development and deeper understanding of our faith, helping members grow in their journey with Christ.",
    icon: Church,
  },
];

export default function About() {
  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-16">
        <h1 className="text-4xl font-bold mb-6 text-center">About Tewahedo Answers</h1>
        <p className="text-xl text-center max-w-3xl mx-auto text-muted-foreground mb-12">
          A community-driven platform dedicated to answering questions about the
          Ethiopian Orthodox Tewahedo Church, fostering understanding and spiritual growth.
        </p>
      </div>

      {/* Feature Section */}
      <section className="py-16">
          <div className="grid gap-x-20 rounded-lg border border-border bg-accent p-6 md:grid-cols-2 md:p-8 lg:p-16">
            <div className="mb-8 flex justify-center lg:justify-start xl:mb-0">
              <img
              src="/ethiopian-church.jpg"
              alt="Ethiopian Orthodox Tewahedo Church"
              className="aspect-square h-full w-full rounded-md object-cover object-center"
              />
            </div>
            <ul className="flex flex-col justify-center gap-y-8">
              {features.map((feature) => (
                <li key={feature.id} className="flex">
                  <feature.icon className="mr-3 size-5 shrink-0 text-primary lg:mr-6 lg:size-6" />
                  <div>
                    <div className="mb-3 text-sm font-semibold text-accent-foreground md:text-base">
                      {feature.title}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground md:text-base">
                      {feature.description}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
      </section>

      {/* Mission Statement */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">Our Mission</h2>
          <p className="text-muted-foreground">
            Our mission is to provide accurate, thoughtful answers to questions about our faith, 
            traditions, and practices. We strive to be a reliable resource for both members of 
            the Ethiopian Orthodox Tewahedo Church and those interested in learning more about 
            our ancient Christian tradition.
          </p>
        </div>
      </div>
    </div>
  );
}