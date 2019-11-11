import React from 'react'
import Layout from '../../src/Layout'
import {NextPage} from "next"
import dynamic from 'next/dynamic'

const Tipping = dynamic(
  () => import('../../components/tipping'),
  { ssr: false }
)

const Page: NextPage = () => {

  return (
    <Layout title="ILP Overflow">
      <div className="max-w-xl flex flex-col shadow-lg rounded-lg bg-white mx-auto px-16 py-16 mt-16 mb-16">
        <div className="mb-8">ILP Overflow</div>
        <div className="text-2xl">
          How does OAuth 2 protect against things like replay attacks using the Security Token?
        </div>
        <div className="border-b-2 border-solid border-grey-light my-4"/>
        <div className="flex">
          <div className="w-12">
            <Tipping/>
          </div>
          <div className="flex-1 px-4">
            <div className="flex flex-col">
              <div>
                <p>As I understand it, the following chain of events occurs in OAuth 2 in order for <code>Site-A</code> to
                  access <strong>User's</strong> information from <code>Site-B</code>.</p>

                <ol>
                  <li><code>Site-A</code> registers on <code>Site-B</code>, and obtains a Secret and an ID.</li>
                  <li>When <strong>User</strong> tells <code>Site-A</code> to
                    access <code>Site-B</code>, <strong>User</strong> is sent to <code>Site-B</code> where they
                    tell <code>Site-B</code> that they would indeed like to give <code>Site-A</code> permissions to
                    specific information.
                  </li>
                  <li><code>Site-B</code> redirects <strong>User</strong> back to <code>Site-A</code>, along with an
                    Authorization Code.
                  </li>
                  <li><code>Site-A</code> then passes that Authorization Code along with its Secret back
                    to <code>Site-B</code> in return for a Security Token.
                  </li>
                  <li><code>Site-A</code> then makes requests to <code>Site-B</code> on behalf of <strong>User</strong> by
                    bundling the Security Token along with requests.
                  </li>
                </ol>

                <p>How does all of this work in terms of security and encryption, on a high level? How does OAuth 2
                  protect against things like replay attacks using the Security Token?</p>
              </div>
              <div className="">
                Author Deets
              </div>
            </div>
          </div>
        </div>
        <div className="border-b-2 border-solid border-grey-light my-4"/>
        <div className="flex">
          <div className="w-12">
            <Tipping/>
          </div>
          <div className="flex-1 px-4">
              <p>How OAuth 2.0 works in real life:</p>

              <p>I was driving by Olaf's bakery on my way to work when I saw the most delicious donut in the window -- I
                mean, the thing was dripping chocolatey goodness. So I went inside and demanded "I must have that
                donut!". He said "sure that will be $30." </p>

              <p>Yeah I know, $30 for one donut! It must be delicious! I reached for my wallet when suddenly I heard the
                chef yell "NO! No donut for you". I asked: why? He said he only accepts bank transfers.</p>

              <p>Seriously? Yep, he was serious. I almost walked away right there, but then the donut called out to me:
                "Eat me, I'm delicious...". Who am I to disobey orders from a donut? I said ok.</p>

              <p>He handed me a note with his name on it (the chef, not the donut): "Tell them Olaf sent you". His name
                was already on the note, so I don't know what the point of saying that was, but ok.</p>

              <p>I drove an hour and a half to my bank. I handed the note to the teller; I told her Olaf sent me. She
                gave me one of those looks, the kind that says, "I can read".</p>

              <p>She took my note, asked for my id, asked me how much money was ok to give him. I told her $30 dollars.
                She did some scribbling and handed me another note. This one had a bunch of numbers on it, I guessed
                that's how they keep track of the notes.</p>

              <p>At that point I'm starving. I rushed out of there, an hour and a half later I was back, standing in
                front of Olaf with my note extended. He took it, looked it over and said, "I'll be back".</p>

              <p>I thought he was getting my donut, but after 30 minutes I started to get suspicious. So I asked the guy
                behind the counter "Where's Olaf?". He said "He went to get money". "What do you mean?". "He take note
                to bank".</p>

              <p>Huh... so Olaf took the note that the bank gave me and went back to the bank to get money out of my
                account. Since he had the note the bank gave me, the bank knew he was the guy I was talking about, and
                because I spoke with the bank they knew to only give him $30.</p>

              <p>It must have taken me a long time to figure that out because by the time I looked up, Olaf was standing
                in front of me <em>finally</em> handing me my donut. Before I left I had to ask, "Olaf, did you always
                sell donuts this way?". "No, I used to do it different."</p>

              <p>Huh. As I was walking back to my car my phone rang. I didn't bother answering, it was probably my job
                calling to fire me, my boss is such a ***. Besides, I was caught up thinking about the process I just
                went through. </p>

              <p>I mean think about it: I was able to let Olaf take $30 out of my bank account without having to give
                him my account information. And I didn't have to worry that he would take out too much money because I
                already told the bank he was only allowed to take $30. And the bank knew he was the right guy because he
                had the note they gave me to give to Olaf.</p>

              <p>Ok, sure I would rather hand him $30 from my pocket. But now that he had that note I could just tell
                the bank to let him take $30 every week, then I could just show up at the bakery and I didn't have to go
                to the bank anymore. I could even order the donut by phone if I wanted to.</p>

              <p>Of course I'd never do that -- that donut was disgusting.</p>

              <p>I wonder if this approach has broader applications. He mentioned this was his second approach, I could
                call it Olaf 2.0. Anyway I better get home, I gotta start looking for a new job. But not before I get
                one of those strawberry shakes from that new place across town, I need something to wash away the taste
                of that donut.</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

Page.getInitialProps = async ({ req }) => {
  return {}
}

export default Page
