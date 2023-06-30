import {useAuth} from "react-oidc-context";
import {Block, Box, Button, Container, Heading, Hero, Progress} from "react-bulma-components";

export function LoginPage() {
    // get the authentication context
    const auth = useAuth()

    // now check the state of the current login process and return a page
    // containing an appropriate message
    switch (auth.activeNavigator) {
        case "signinSilent":
            return (
                <Hero color={"dark"} size={"fullheight"}>
                    <Hero.Body>
                        <Container>
                            <Heading color={"primary"}>
                                Login wird durchgeführt
                            </Heading>
                            <Block>
                                <Progress max={100} color={"primary"}/>
                            </Block>
                        </Container>
                    </Hero.Body>
                </Hero>
            );
        case "signinRedirect":
            return (
                <Hero color={"dark"} size={"fullheight"}>
                    <Hero.Body>
                        <Container>
                            <Heading color={"success"}>
                                Login wird durchgeführt
                            </Heading>
                            <Heading subtitle>
                                Sollten sie nicht weitergeleitet werden. Klicken
                                Sie
                            </Heading>
                            <Block>
                                <Progress max={100} color={"success"}/>
                            </Block>
                        </Container>
                    </Hero.Body>
                </Hero>
            )
        case "signoutRedirect":
            return (
                <Hero color={"dark"} size={"fullheight"}>
                    <Hero.Body>
                        <Container>
                            <Heading color={"primary"}>
                                Sie werden nun abgemeldet...
                            </Heading>
                            <Heading subtitle>
                                Sie werden zu ihrem Identity Provider weitergeleitet.
                            </Heading>
                            <Block>
                                <Progress max={100} color={"primary"}/>
                            </Block>
                        </Container>
                    </Hero.Body>
                </Hero>
            )
    }

    // now check if the authentication is currently loading
    if (auth.isLoading) {
        return (
            <Hero color={"dark"} size={"fullheight"}>
                <Hero.Body>
                    <Container>
                        <Heading color={"success"}>
                            Benutzerinformationen werden geladen
                        </Heading>
                        <Heading subtitle>
                            Sollten sie nicht weitergeleitet werden. Klicken
                            Sie
                        </Heading>
                        <Block>
                            <Progress max={100} color={"success"}/>
                        </Block>
                    </Container>
                </Hero.Body>
            </Hero>
        )
    }

    // now check if an error occurred
    if (auth.error) {
        // log the error to the console
        console.log(auth.error)
        // return the error message
        return (
            <Hero color={"danger"} colorVariant={"dark"} size={"fullheight"}>
                <Hero.Body>
                    <Container>
                        <Heading color={"primary"}>
                            Es ist ein Fehler aufgetreten
                        </Heading>
                        <Heading subtitle>
                            Bei der Verarbeitung des Logins ist ein Fehler
                            aufgetreten. Eine Beschreibung des Fehlers finden
                            Sie hier:
                        </Heading>
                        <Box>
                            <p className={"is-family-code"}>
                                {auth.error.stack}
                            </p>
                        </Box>
                    </Container>
                </Hero.Body>
            </Hero>
        )
    }

    // now check if the authentication worked
    if (auth.isAuthenticated) {
        console.log(auth.user)
        // redirect the user to the main page
        window.location.replace("/")
    }


    // now try to infer the hostname of the identity provider
    let url = new URL(auth.settings.authority)
    let authHost = url.host

    // since the user is not logged in, display the login page
    return (
        <Hero color={"dark"} size={"fullheight"}>
            <Hero.Body>
                <Container>
                    <Heading color={"primary"}>
                        Digitales Filmmanagement des Unikinos GEGENLICHT
                    </Heading>
                    <Heading subtitle>
                        Bitte Logge dich über den Button unten ein!
                    </Heading>
                    <Button type={"button"} color={"link"} onClick={() => {
                        auth.signinRedirect()
                    }}>
                        Über "<span className={"is-family-code"}>{authHost}</span>" anmelden.
                    </Button>
                </Container>
            </Hero.Body>
        </Hero>
    )


}