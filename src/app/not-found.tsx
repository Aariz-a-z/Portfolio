import { Container } from '@/components/layout/Container';
import { ButtonLink } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <Container>
      <div className="flex flex-col items-start gap-5 py-24 sm:py-32">
        <p className="t-micro uppercase text-text-muted">404</p>
        <h1 className="t-h1 text-text">This page does not exist</h1>
        <p className="t-body measure text-text-secondary">
          The link may be out of date, or the address may have a typo in it.
        </p>
        <ButtonLink href="/" variant="primary">
          Back to portfolio
        </ButtonLink>
      </div>
    </Container>
  );
}
