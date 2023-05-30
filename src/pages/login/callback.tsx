import {useAuth} from "react-oidc-context";
import {Block, Box, Button, Container, Heading, Hero, Progress} from "react-bulma-components";

export function LoginCallback() {
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
}
export default LoginCallback;