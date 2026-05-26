import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";

describe("ScrollToTop", () => {
  it("scrolls to top on landing routes", () => {
    const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={["/gioi-thieu"]}>
        <ScrollToTop />
        <Routes>
          <Route path="/gioi-thieu" element={<div>about</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(scrollToSpy).toHaveBeenCalledTimes(1);

    render(
      <MemoryRouter initialEntries={["/thanh-toan"]}>
        <ScrollToTop />
        <Routes>
          <Route path="/thanh-toan" element={<div>payment</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(scrollToSpy).toHaveBeenCalledTimes(2);
    scrollToSpy.mockRestore();
  });

  it("does not scroll on non-landing routes", () => {
    const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={["/khoa-hoc"]}>
        <ScrollToTop />
        <Routes>
          <Route path="/khoa-hoc" element={<div>courses</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(scrollToSpy).not.toHaveBeenCalled();
    scrollToSpy.mockRestore();
  });
});
